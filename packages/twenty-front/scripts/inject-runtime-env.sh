#!/bin/sh

if [ -z "$REACT_APP_SERVER_BASE_URL" ]; then
  echo "Error: REACT_APP_SERVER_BASE_URL is not set."
  exit 1
fi

if [ "$AUTH_TYPE" = "SSO" ] && [ -z "$SMB_NAME" ]; then
  # SMB_NAME is required when AUTH_TYPE=SSO. No default — fail loudly so
  # the SPA never silently rewrites the logout host to the wrong domain.
  # Same env name across every devstack app — see sso-rules RULES.md.
  echo "Error: SMB_NAME is required when AUTH_TYPE=SSO." >&2
  echo "       Set it to the portal hostname prefix (e.g. 'moneta')." >&2
  exit 1
fi

# Reject characters that would break out of the JSON string and corrupt
# the generated <script> block (or, worst case, inject script content).
# These values come from compose env (not user-controlled today), but the
# script is also reused outside the bundled build, so harden the boundary.
for value in "$REACT_APP_SERVER_BASE_URL" "$AUTH_TYPE" "$SMB_NAME"; do
  case "$value" in
    *'"'* | *'<'* | *'>'* | *\\* | *'	'* | *'
'*)
      echo "Error: env values must not contain quotes, angle brackets, backslashes, tabs, or newlines." >&2
      exit 1
      ;;
  esac
done

echo "Injecting runtime environment variables into index.html..."

CONFIG_BLOCK=$(cat << EOF
    <script id="twenty-env-config">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$REACT_APP_SERVER_BASE_URL",
        AUTH_TYPE: "$AUTH_TYPE",
        SMB_NAME: "$SMB_NAME"
      };
    </script>
    <!-- END: Twenty Config -->
EOF
)
# Use sed to replace the config block in index.html
# Using pattern space to match across multiple lines
echo "$CONFIG_BLOCK" | sed -i.bak '
  /<!-- BEGIN: Twenty Config -->/,/<!-- END: Twenty Config -->/{
    /<!-- BEGIN: Twenty Config -->/!{
      /<!-- END: Twenty Config -->/!d
    }
    /<!-- BEGIN: Twenty Config -->/r /dev/stdin
    /<!-- END: Twenty Config -->/d
  }
' build/index.html
rm -f build/index.html.bak
