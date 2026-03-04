#!/bin/sh

echo "Injecting runtime environment variables into index.html..."

CONFIG_BLOCK=$(cat << EOF
    <script id="fuse-env-config">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$REACT_APP_SERVER_BASE_URL"
      };
    </script>
    <!-- END: Fuse Config -->
EOF
)
# Use sed to replace the config block in index.html
# Using pattern space to match across multiple lines
echo "$CONFIG_BLOCK" | sed -i.bak '
  /<!-- BEGIN: Fuse Config -->/,/<!-- END: Fuse Config -->/{
    /<!-- BEGIN: Fuse Config -->/!{
      /<!-- END: Fuse Config -->/!d
    }
    /<!-- BEGIN: Fuse Config -->/r /dev/stdin
    /<!-- END: Fuse Config -->/d
  }
' build/index.html
rm -f build/index.html.bak
