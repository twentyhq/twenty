#!/usr/bin/env bash
set -euo pipefail

name=""
url="${TWENTY_MCP_URL:-}"
print_url="false"

usage() {
  cat <<'EOF'
Usage: setup-mcp.sh [--name server-name] [--print-url] <workspace-url-or-mcp-url>

Examples:
  setup-mcp.sh acme.twenty.com
  setup-mcp.sh https://crm.example.com
  setup-mcp.sh --name twenty-local acme.localhost:3001
  setup-mcp.sh --name twenty-prod https://crm.example.com/mcp

OAuth:
  After the server is added, open Claude Code and run /mcp to start OAuth
  for the new server. Tokens are stored securely and refreshed automatically.

Environment:
  TWENTY_MCP_URL   MCP URL to use when no URL argument is provided.
EOF
}

normalize_url() {
  local raw="$1"
  raw="${raw#"${raw%%[![:space:]]*}"}"
  raw="${raw%"${raw##*[![:space:]]}"}"
  raw="${raw%/}"

  if [[ "$raw" != http://* && "$raw" != https://* ]]; then
    if [[ "$raw" == localhost* || "$raw" == 127.* || "$raw" == "[::1]"* || "$raw" == *.localhost || "$raw" == *.localhost:* ]]; then
      raw="http://$raw"
    else
      raw="https://$raw"
    fi
  fi

  if [[ "$raw" != */mcp ]]; then
    raw="${raw%/}/mcp"
  fi

  echo "$raw"
}

derive_name() {
  local normalized="$1"
  local host="${normalized#http://}"
  host="${host#https://}"
  host="${host%%/*}"
  host="${host#*@}"
  host="${host#[}"
  host="${host%]}"

  local port=""
  if [[ "$host" == *:* && "$host" != *:*:* ]]; then
    port="${host##*:}"
    host="${host%%:*}"
  fi

  local stem="$host"
  if [[ "$stem" == *.twenty.com ]]; then
    stem="${stem%.twenty.com}"
  elif [[ "$stem" == *.* && "$stem" != localhost && "$stem" != *.localhost ]]; then
    stem="${stem%.*}"
  fi

  if [[ -n "$port" ]]; then
    stem="$stem-$port"
  fi

  stem="$(printf '%s' "$stem" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"

  if [[ -z "$stem" ]]; then
    echo "twenty"
  else
    echo "twenty-$stem"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      name="${2:-}"
      shift 2
      ;;
    --print-url)
      print_url="true"
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      url="$1"
      shift
      ;;
  esac
done

if [[ -z "$url" ]]; then
  echo "A Twenty workspace URL is required, for example: https://crm.example.com" >&2
  echo
  usage
  exit 1
fi

url="$(normalize_url "$url")"

if [[ -z "$name" ]]; then
  name="$(derive_name "$url")"
fi

if [[ "$print_url" == "true" ]]; then
  echo "$url"
  exit 0
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "The claude CLI is required but was not found in PATH." >&2
  echo "Install Claude Code from https://docs.claude.com/en/docs/claude-code/quickstart" >&2
  exit 1
fi

if claude mcp get "$name" >/dev/null 2>&1; then
  claude mcp remove "$name" >/dev/null
fi

claude mcp add --transport http "$name" "$url"

echo "Configured Twenty MCP:"
echo "  name: $name"
echo "  url:  $url"
echo
echo "Next step:"
echo "  Open Claude Code and run /mcp to start OAuth for $name."
