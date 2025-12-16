import { type SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';

export const XLSX_SKILL: SkillDefinition = {
  name: 'xlsx',
  label: 'Excel & Spreadsheets',
  description:
    'Excel/spreadsheet creation, editing, and analysis with formulas, formatting, and visualization',
  content: `# Excel Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

- \`python /home/user/scripts/xlsx/recalc.py <excel_file> [timeout]\` - Recalculate formulas using LibreOffice

## Requirements

### Zero Formula Errors
Every Excel model MUST be delivered with ZERO formula errors (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?)

### Use Formulas, Not Hardcoded Values
**Always use Excel formulas instead of calculating values in Python and hardcoding them.**

\`\`\`python
# ❌ WRONG - Hardcoding
total = df['Sales'].sum()
sheet['B10'] = total

# ✅ CORRECT - Using formulas
sheet['B10'] = '=SUM(B2:B9)'
\`\`\`

## Reading and Analyzing Data

\`\`\`python
import pandas as pd

# Read Excel
df = pd.read_excel('file.xlsx')
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # All sheets as dict

# Analyze
df.head()
df.info()
df.describe()
\`\`\`

## Creating New Excel Files

\`\`\`python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

# Add data
sheet['A1'] = 'Hello'
sheet.append(['Row', 'of', 'data'])

# Add formula
sheet['B2'] = '=SUM(A1:A10)'

# Formatting
sheet['A1'].font = Font(bold=True)
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')

# Column width
sheet.column_dimensions['A'].width = 20

wb.save('/home/user/output/output.xlsx')
\`\`\`

## Editing Existing Files

\`\`\`python
from openpyxl import load_workbook

wb = load_workbook('existing.xlsx')
sheet = wb.active

# Modify cells
sheet['A1'] = 'New Value'
sheet.insert_rows(2)

wb.save('/home/user/output/modified.xlsx')
\`\`\`

## Recalculating Formulas (MANDATORY)

After creating/editing files with formulas, run:
\`\`\`bash
python /home/user/scripts/xlsx/recalc.py /home/user/output/output.xlsx
\`\`\`

The script returns JSON with error details:
\`\`\`json
{
  "status": "success",
  "total_errors": 0,
  "total_formulas": 42,
  "error_summary": {}
}
\`\`\`

If errors found, fix them and recalculate again.

## Financial Model Color Coding

- **Blue text**: Hardcoded inputs
- **Black text**: Formulas and calculations
- **Green text**: Links from other worksheets
- **Yellow background**: Key assumptions needing attention

## Number Formatting

- Years: Format as text ("2024" not "2,024")
- Currency: Use $#,##0 format
- Percentages: 0.0% format
- Negatives: Use parentheses (123) not minus -123

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read Excel | pandas | \`pd.read_excel('file.xlsx')\` |
| Create Excel | openpyxl | \`Workbook()\` |
| Add formula | openpyxl | \`sheet['B2'] = '=SUM(A1:A10)'\` |
| Recalculate | script | \`python /home/user/scripts/xlsx/recalc.py file.xlsx\` |`,
};
