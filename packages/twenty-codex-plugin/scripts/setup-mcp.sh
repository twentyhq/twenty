#!/usr/bin/env bash
set -euo pipefail

name=""
url="${TWENTY_MCP_URL:-}"
force_login="false"
print_url="false"

usage() {
  cat <<'EOF'
Usage: setup-mcp.sh [--name server-name] [--force-login] [--print-url] <workspace-url-or-mcp-url>

Examples:
  setup-mcp.sh acme.twenty.com
  setup-mcp.sh --force-login https://crm.example.com
  setup-mcp.sh --name twenty-local acme.localhost:3001
  setup-mcp.sh --name twenty-prod https://crm.example.com/mcp

OAuth:
  Codex may open OAuth automatically after the server is added.
  Use --force-login only if that does not happen.

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
    --login)
      echo "Warning: --login is deprecated and ignored. Codex starts OAuth during MCP setup when needed; use --force-login only as a manual fallback." >&2
      shift
      ;;
    --force-login)
      force_login="true"
      shift
      ;;
    --print-url)
      print_url="true"
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    --)
      shift
      url="${1:-$url}"
      break
      ;;
    -*)
      echo "Unknown option: $1" >&2
      echo >&2
      usage >&2
      exit 1
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

if ! command -v codex >/dev/null 2>&1; then
  echo "The codex CLI is required but was not found in PATH." >&2
  exit 1
fi

is_codex_managed_shell() {
  [[ -n "${CODEX_THREAD_ID:-}" || "${CODEX_INTERNAL_ORIGINATOR_OVERRIDE:-}" == *"Codex"* ]]
}

if codex mcp get "$name" >/dev/null 2>&1; then
  codex mcp remove "$name" >/dev/null
fi

codex mcp add "$name" --url "$url"

echo "Configured Twenty MCP:"
echo "  name: $name"
echo "  url:  $url"
echo

if [[ "$force_login" == "true" ]]; then
  if is_codex_managed_shell; then
    echo "Skipped forced OAuth login because this helper is running inside Codex."
    echo "Codex may open OAuth automatically after the MCP server is added."
    echo
    echo "If no OAuth window opens, run:"
    echo "  codex mcp login $name"
    exit 0
  fi

  codex mcp login "$name"
else
  echo "Next step:"
  echo "  Codex may open OAuth automatically. If it does not, run:"
  echo "  codex mcp login $name"
fi
