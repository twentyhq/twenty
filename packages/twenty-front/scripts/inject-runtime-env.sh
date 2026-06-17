#!/bin/sh

if [ -z "$REACT_APP_SERVER_BASE_URL" ]; then
  echo "Error: REACT_APP_SERVER_BASE_URL is not set."
  exit 1
fi

echo "Injecting runtime environment variables into index.html..."

DOCK_LINE=""
if [ -n "$REACT_APP_DIALER_DOCK_URL" ]; then
  DOCK_LINE="        REACT_APP_DIALER_DOCK_URL: \"$REACT_APP_DIALER_DOCK_URL\","
fi

# Propel Marketing Hub (P3 graduated heroes) — runtime toggle. NOTE: the FE reads
# Boolean(window._env_.REACT_APP_PROPEL_MARKETING_HUB), so any NON-EMPTY value
# enables it (set "true" to enable; leave UNSET to disable — do NOT set "false").
HUB_LINE=""
if [ -n "$REACT_APP_PROPEL_MARKETING_HUB" ]; then
  HUB_LINE="        REACT_APP_PROPEL_MARKETING_HUB: \"$REACT_APP_PROPEL_MARKETING_HUB\","
fi

CONFIG_BLOCK=$(cat << EOF
    <script id="twenty-env-config">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$REACT_APP_SERVER_BASE_URL",
$DOCK_LINE
$HUB_LINE
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
