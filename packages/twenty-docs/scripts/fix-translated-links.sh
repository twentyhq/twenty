#!/bin/bash

# Post-processing script to fix internal links in translated documentation
# This script adds the locale prefix to all internal documentation links
# Works for any language by automatically detecting language directories

set -e

if [ -d "packages/twenty-docs" ]; then
  DOCS_DIR="packages/twenty-docs"
elif [ -d "fr" ] || [ -d "user-guide" ]; then
  DOCS_DIR="."
else
  echo "❌ Error: Cannot find documentation directory"
  exit 1
fi

echo "🔧 Fixing internal links in translated documentation..."

EXCLUDED_DIRS="images|snippets|user-guide|developers|twenty-ui|node_modules|scripts"

for lang_dir in "$DOCS_DIR"/*/ ; do
  lang_code=$(basename "$lang_dir")

  if [[ "$lang_code" =~ ^($EXCLUDED_DIRS)$ ]]; then
    continue
  fi

  if [ ! -d "$lang_dir" ] || [ -z "$(ls -A "$lang_dir")" ]; then
    continue
  fi

  echo "📝 Processing $lang_code documentation..."

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/user-guide/|href=\"/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/developers/|href=\"/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|href=\"/twenty-ui/|href=\"/$lang_code/twenty-ui/|g" {} \;

  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/user-guide/|](/$lang_code/user-guide/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/developers/|](/$lang_code/developers/|g" {} \;
  find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
    "s|](/twenty-ui/|](/$lang_code/twenty-ui/|g" {} \;

  find "$lang_dir" -name "*.bak" -type f -delete

  echo "✅ $lang_code documentation links fixed"
done

echo "🎉 All translated links have been fixed!"

