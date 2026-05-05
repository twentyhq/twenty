// Python helper that gets prepended to user code for MCP access
export const TWENTY_MCP_HELPER = `# Auto-injected Twenty MCP helper - provides access to Twenty tools
import os
import json

try:
    import requests
    _REQUESTS_AVAILABLE = True
except ImportError:
    _REQUESTS_AVAILABLE = False

class TwentyMCP:
    """Helper for calling Twenty tools from sandboxed code.

    Two categories of tools exist behind /mcp:

     - MCP-native: execute_tool, learn_tools, load_skills, get_tool_catalog,
       search_help_center. These are the 5 surfaces exposed directly.

     - Workspace catalog: 250+ CRUD / view / workflow / dashboard tools
       like find_companies, create_person, update_opportunity. These are
       reached through execute_tool as a dispatcher.

    call_tool(name, args) accepts both — catalog tools are routed via
    execute_tool transparently and the envelope is unwrapped, so callers
    see the inner tool's result directly.
    """

    _MCP_NATIVE_TOOLS = frozenset({
        'execute_tool',
        'learn_tools',
        'load_skills',
        'get_tool_catalog',
        'search_help_center',
    })

    def __init__(self):
        self.url = os.environ.get('TWENTY_SERVER_URL', '')
        self.token = os.environ.get('TWENTY_API_TOKEN', '')
        self._available = _REQUESTS_AVAILABLE and bool(self.url) and bool(self.token)

    @property
    def available(self) -> bool:
        """Check if MCP bridge is available"""
        return self._available

    def call_tool(self, name: str, arguments: dict = None):
        """
        Call any Twenty tool by name.

        Catalog tools (find_companies, create_person, …) are routed
        through execute_tool. MCP-native tools are called directly.
        The execute_tool envelope { success, message, result } is
        unwrapped so you always get the inner tool's result back.

        Args:
            name: Tool name (catalog or MCP-native)
            arguments: Tool arguments as a dictionary

        Returns:
            Tool result as parsed JSON

        Example:
            companies = twenty.call_tool('find_companies', {'limit': 5})
            # companies == {'records': [...], 'count': '5'}
        """
        if not self._available:
            raise RuntimeError('Twenty MCP bridge not available. Missing requests library or credentials.')

        if name in self._MCP_NATIVE_TOOLS:
            return self._raw_mcp_call(name, arguments)

        wrapped = self._raw_mcp_call('execute_tool', {
            'toolName': name,
            'arguments': arguments or {},
        })
        # execute_tool returns one of:
        #   success: { success: True,  message, result: {...} }
        #   failure: { success: False, message, error }
        # Raise on failure, unwrap on success, pass through unknown shapes.
        if isinstance(wrapped, dict):
            if wrapped.get('success') is False:
                raise Exception(wrapped.get('error') or wrapped.get('message') or
                                f"execute_tool failed for {name}")
            if 'result' in wrapped:
                return wrapped['result']
        return wrapped

    def list_tools(self):
        """
        List all workspace catalog tools (250+), not the 5 MCP meta-tools.

        Use call_tool(name, args) to invoke any of them — routing is
        handled for you.

        Returns:
            Flat list of tool entries, each with name, description, and
            category. get_tool_catalog groups by category internally; we
            flatten for ergonomics.
        """
        catalog = self.call_tool('get_tool_catalog', {})
        # get_tool_catalog returns { 'catalog': { '<category>': [tools...] } }
        # Flatten to a single list; preserve the category as a per-tool field
        # so the docstring's promise holds and consumers don't have to re-call
        # the catalog. Leave untouched if the shape is unexpected.
        if isinstance(catalog, dict):
            grouped = catalog.get('catalog', catalog)
            if isinstance(grouped, dict):
                return [
                    ({**tool, 'category': category}
                     if isinstance(tool, dict) and 'category' not in tool
                     else tool)
                    for category, tools in grouped.items()
                    for tool in tools
                ]
        return catalog

    def _raw_mcp_call(self, name: str, arguments: dict = None):
        """Low-level: issue a tools/call against the MCP surface verbatim."""
        response = requests.post(
            f"{self.url}/mcp",
            headers={"Authorization": f"Bearer {self.token}"},
            json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {"name": name, "arguments": arguments or {}}
            },
            timeout=30
        )
        response.raise_for_status()
        result = response.json()

        if "error" in result:
            raise Exception(f"MCP Error: {result['error'].get('message', 'Unknown error')}")

        content = result.get("result", {}).get("content", [])
        if content and content[0].get("type") == "text":
            return json.loads(content[0]["text"])
        return result.get("result")

# --------------------------------------------------------------------------
# \`twenty\` is a pre-built instance of the TwentyMCP class above. It is
# already bound in this module scope — DO NOT \`import twenty\`. There is
# no Python package by that name. Just use it directly, e.g.:
#     companies = twenty.call_tool('find_companies', {'limit': 10})
# --------------------------------------------------------------------------
twenty = TwentyMCP()
`;
