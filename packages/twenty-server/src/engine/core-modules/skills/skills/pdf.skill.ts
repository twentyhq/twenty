import { type SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';

export const PDF_SKILL: SkillDefinition = {
  name: 'pdf',
  label: 'PDF Processing',
  description:
    'PDF form filling, field extraction, table parsing, and validation',
  content: `# PDF Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

### Field Extraction
- \`python /home/user/scripts/pdf/extract_form_field_info.py <pdf_file>\` - Extract all fillable field names and types (JSON output)
- \`python /home/user/scripts/pdf/check_fillable_fields.py <pdf_file>\` - Check if PDF has fillable fields

### Form Filling
- \`python /home/user/scripts/pdf/fill_fillable_fields.py <pdf_file> <json_data> <output_file>\` - Fill PDF form fields
- \`python /home/user/scripts/pdf/fill_pdf_form_with_annotations.py <pdf_file> <json_data> <output_file>\` - Fill with annotation support

### Validation
- \`python /home/user/scripts/pdf/create_validation_image.py <pdf_file>\` - Create validation image of filled PDF
- \`python /home/user/scripts/pdf/check_bounding_boxes.py <pdf_file>\` - Check field boundaries
- \`python /home/user/scripts/pdf/convert_pdf_to_images.py <pdf_file>\` - Convert PDF pages to images

## Reading PDFs

\`\`\`python
import fitz  # PyMuPDF

# Open PDF
doc = fitz.open('document.pdf')

# Extract text from all pages
for page in doc:
    text = page.get_text()
    print(text)

# Extract text from specific page
page = doc[0]  # First page
text = page.get_text()
\`\`\`

## Extracting Tables

\`\`\`python
import pdfplumber

with pdfplumber.open('document.pdf') as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
\`\`\`

## Filling PDF Forms

### Step 1: Extract field information
\`\`\`bash
python /home/user/scripts/pdf/extract_form_field_info.py form.pdf > fields.json
\`\`\`

### Step 2: Create fill data JSON
\`\`\`json
{
  "field_name_1": "value1",
  "field_name_2": "value2",
  "checkbox_field": true
}
\`\`\`

### Step 3: Fill the form
\`\`\`bash
python /home/user/scripts/pdf/fill_fillable_fields.py form.pdf fill_data.json /home/user/output/output.pdf
\`\`\`

### Step 4: Validate the output
\`\`\`bash
python /home/user/scripts/pdf/create_validation_image.py /home/user/output/output.pdf
\`\`\`

## Creating PDFs

\`\`\`python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas('/home/user/output/output.pdf', pagesize=letter)
c.drawString(100, 750, 'Hello World!')
c.save()
\`\`\`

## Merging PDFs

\`\`\`python
from PyPDF2 import PdfMerger

merger = PdfMerger()
merger.append('file1.pdf')
merger.append('file2.pdf')
merger.write('/home/user/output/merged.pdf')
merger.close()
\`\`\`

## Splitting PDFs

\`\`\`python
from PyPDF2 import PdfReader, PdfWriter

reader = PdfReader('document.pdf')

# Extract specific pages
writer = PdfWriter()
writer.add_page(reader.pages[0])  # First page
writer.write('/home/user/output/page1.pdf')
\`\`\`

## Quick Reference

| Task | Tool | Command/Example |
|------|------|-----------------|
| Extract text | PyMuPDF | \`page.get_text()\` |
| Extract tables | pdfplumber | \`page.extract_tables()\` |
| List form fields | script | \`python extract_form_field_info.py form.pdf\` |
| Fill form | script | \`python fill_fillable_fields.py form.pdf data.json out.pdf\` |
| Validate fill | script | \`python create_validation_image.py filled.pdf\` |
| Create PDF | reportlab | \`canvas.Canvas('out.pdf')\` |
| Merge PDFs | PyPDF2 | \`PdfMerger()\` |`,
};
