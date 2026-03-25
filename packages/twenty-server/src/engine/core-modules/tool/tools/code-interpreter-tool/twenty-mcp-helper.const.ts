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
    """Helper class to call Twenty tools via MCP protocol"""

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
        Call a Twenty tool via MCP protocol.

        Args:
            name: Tool name (e.g., 'find_person_records', 'create_company_record')
            arguments: Tool arguments as a dictionary

        Returns:
            Tool result as parsed JSON

        Example:
            people = twenty.call_tool('find_person_records', {'limit': 10})
        """
        if not self._available:
            raise RuntimeError('Twenty MCP bridge not available. Missing requests library or credentials.')

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

    def list_tools(self):
        """
        List all available Twenty tools.

        Returns:
            List of tool definitions with name, description, and inputSchema
        """
        if not self._available:
            raise RuntimeError('Twenty MCP bridge not available.')

        response = requests.post(
            f"{self.url}/mcp",
            headers={"Authorization": f"Bearer {self.token}"},
            json={
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/list",
                "params": {}
            },
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        return result.get("result", {}).get("tools", [])

# Pre-instantiated helper - use 'twenty' in your code
twenty = TwentyMCP()
`;
