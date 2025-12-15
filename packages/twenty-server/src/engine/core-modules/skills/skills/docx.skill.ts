import { type SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';

export const DOCX_SKILL: SkillDefinition = {
  name: 'docx',
  label: 'Word Documents',
  description:
    'Word document creation, editing, template processing, and OOXML manipulation',
  content: `# Word Document Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts (OOXML Editing)

- \`python /home/user/scripts/docx/unpack.py <docx_file> <output_dir>\` - Unpack .docx to XML files for direct editing
- \`python /home/user/scripts/docx/pack.py <input_dir> <docx_file>\` - Repack XML files into .docx
- \`python /home/user/scripts/docx/validate.py <docx_file>\` - Validate document structure

### Validation Scripts
- \`/home/user/scripts/docx/validation/docx.py\` - DOCX validation module
- \`/home/user/scripts/docx/validation/redlining.py\` - Track changes/redline validation

## High-Level API (python-docx)

### Reading Documents

\`\`\`python
from docx import Document

doc = Document('document.docx')

# Read paragraphs
for para in doc.paragraphs:
    print(para.text)

# Read tables
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            print(cell.text)
\`\`\`

### Creating Documents

\`\`\`python
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# Add heading
doc.add_heading('Document Title', 0)

# Add paragraph with formatting
para = doc.add_paragraph('Normal text. ')
run = para.add_run('Bold text.')
run.bold = True

# Add table
table = doc.add_table(rows=2, cols=2)
table.cell(0, 0).text = 'Header 1'
table.cell(0, 1).text = 'Header 2'

# Add image
doc.add_picture('image.png', width=Inches(4))

doc.save('/home/user/output/output.docx')
\`\`\`

## Low-Level OOXML Editing

For complex edits (tracked changes, custom XML), use the unpack/edit/pack workflow:

### Step 1: Unpack
\`\`\`bash
python /home/user/scripts/docx/unpack.py document.docx ./unpacked/
\`\`\`

### Step 2: Edit XML directly
\`\`\`python
import xml.etree.ElementTree as ET

tree = ET.parse('./unpacked/word/document.xml')
root = tree.getroot()

# Edit XML...
# Namespaces: w = http://schemas.openxmlformats.org/wordprocessingml/2006/main

tree.write('./unpacked/word/document.xml', xml_declaration=True, encoding='UTF-8')
\`\`\`

### Step 3: Validate & Repack
\`\`\`bash
python /home/user/scripts/docx/validate.py ./unpacked/
python /home/user/scripts/docx/pack.py ./unpacked/ /home/user/output/output.docx
\`\`\`

## Template Processing

### Find and Replace
\`\`\`python
from docx import Document

doc = Document('template.docx')

for para in doc.paragraphs:
    if '{{name}}' in para.text:
        para.text = para.text.replace('{{name}}', 'John Doe')

doc.save('/home/user/output/filled.docx')
\`\`\`

### Preserve Formatting During Replace
\`\`\`python
def replace_in_paragraph(para, old_text, new_text):
    """Replace text while preserving formatting"""
    for run in para.runs:
        if old_text in run.text:
            run.text = run.text.replace(old_text, new_text)

for para in doc.paragraphs:
    replace_in_paragraph(para, '{{name}}', 'John Doe')
\`\`\`

## Working with Styles

\`\`\`python
from docx.shared import Pt, RGBColor

# Set font
run.font.name = 'Arial'
run.font.size = Pt(12)
run.font.color.rgb = RGBColor(0, 0, 0)

# Paragraph formatting
para.alignment = WD_ALIGN_PARAGRAPH.CENTER
para.paragraph_format.space_before = Pt(12)
para.paragraph_format.space_after = Pt(12)
\`\`\`

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read document | python-docx | \`Document('file.docx')\` |
| Create document | python-docx | \`Document()\` |
| Add heading | python-docx | \`doc.add_heading('Title', 0)\` |
| Add table | python-docx | \`doc.add_table(rows=2, cols=2)\` |
| Unpack for editing | script | \`python unpack.py doc.docx ./out/\` |
| Repack | script | \`python pack.py ./out/ doc.docx\` |
| Validate | script | \`python validate.py doc.docx\` |`,
};
