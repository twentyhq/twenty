#!/bin/bash

# Post-processing script to translate Card component titles
# Runs after Crowdin sync to replace English titles with translated ones


set -e

if [ -d "packages/twenty-docs" ]; then
  DOCS_DIR="packages/twenty-docs/l"
  LOCALES_DIR="packages/twenty-docs/locales"
elif [ -d "l" ]; then
  DOCS_DIR="l"
  LOCALES_DIR="locales"
else
  echo "❌ Error: Cannot find locales directory (l/)"
  exit 1
fi

echo "🔧 Translating Card titles in documentation..."

EN_JSON="$LOCALES_DIR/en/card-titles.json"
if [ ! -f "$EN_JSON" ]; then
  echo "❌ Error: English card titles file not found at $EN_JSON"
  exit 1
fi

translate_titles() {
  local lang_code=$1
  local lang_dir="$DOCS_DIR/$lang_code"
  local lang_json="$LOCALES_DIR/$lang_code/card-titles.json"

  if [ ! -d "$lang_dir" ] || [ -z "$(ls -A "$lang_dir" 2>/dev/null)" ]; then
    return
  fi

  if [ ! -f "$lang_json" ]; then
    echo "⚠️  No translation file found for $lang_code (expected: $lang_json)"
    return
  fi

  echo "📝 Processing $lang_code documentation..."

  if command -v jq &> /dev/null; then
    while IFS="=" read -r key value; do
      if [ -n "$key" ] && [ -n "$value" ]; then
        english_value=$(jq -r ".$key // empty" "$EN_JSON" 2>/dev/null)

        if [ -n "$english_value" ]; then
          escaped_english=$(printf '%s\n' "$english_value" | sed 's/[&/\]/\\&/g')
          escaped_translated=$(printf '%s\n' "$value" | sed 's/[&/\]/\\&/g')

          find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
            "s/title=\"${escaped_english}\"/title=\"${escaped_translated}\"/g" {} \;
        fi
      fi
    done < <(jq -r 'to_entries | .[] | "\(.key)=\(.value)"' "$lang_json")
  else
    echo "⚠️  Warning: jq not found, using fallback method (may have issues with special characters)"

    keys=$(grep -o '"[^"]*"' "$EN_JSON" | grep -v '[{}]' | sed 's/"//g' | grep -v '^\s*$')

    while IFS= read -r key; do
      if [ -n "$key" ]; then
        english_value=$(grep "\"$key\"" "$EN_JSON" | sed -E 's/.*"[^"]*"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')
        translated_value=$(grep "\"$key\"" "$lang_json" | sed -E 's/.*"[^"]*"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

        if [ -n "$english_value" ] && [ -n "$translated_value" ]; then
          find "$lang_dir" -name "*.mdx" -type f -exec sed -i.bak \
            "s/title=\"${english_value}\"/title=\"${translated_value}\"/g" {} \;
        fi
      fi
    done <<< "$keys"
  fi

  find "$lang_dir" -name "*.mdx.bak" -type f -delete

  echo "✅ $lang_code Card titles translated"
}
for lang_dir in "$DOCS_DIR"/*/ ; do
  if [ -d "$lang_dir" ]; then
    lang_code=$(basename "$lang_dir")
    translate_titles "$lang_code"
  fi
done

echo "✨ Card title translation complete!"

