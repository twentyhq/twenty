import { type SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';

export const PPTX_SKILL: SkillDefinition = {
  name: 'pptx',
  label: 'PowerPoint',
  description:
    'PowerPoint creation, editing, templates, thumbnails, and slide manipulation',
  content: `# PowerPoint Processing Skill

**IMPORTANT**: Save all output files to \`/home/user/output/\` for them to be downloadable.

## Pre-installed Scripts

- \`python /home/user/scripts/pptx/thumbnail.py <pptx_file> [output_dir]\` - Generate slide thumbnails
- \`python /home/user/scripts/pptx/rearrange.py <pptx_file> <slide_order_json> <output_file>\` - Reorder slides
- \`python /home/user/scripts/pptx/inventory.py <pptx_file>\` - List all slides and their content
- \`python /home/user/scripts/pptx/replace.py <pptx_file> <replacements_json> <output_file>\` - Find/replace text

## Reading Presentations

\`\`\`python
from pptx import Presentation

prs = Presentation('presentation.pptx')

# Iterate through slides
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            print(shape.text)
\`\`\`

## Creating Presentations

\`\`\`python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Add title slide
slide_layout = prs.slide_layouts[0]  # Title layout
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
subtitle = slide.placeholders[1]

title.text = "Presentation Title"
subtitle.text = "Subtitle goes here"

# Add content slide
slide_layout = prs.slide_layouts[1]  # Title and content
slide = prs.slides.add_slide(slide_layout)
title = slide.shapes.title
body = slide.placeholders[1]

title.text = "Slide Title"
tf = body.text_frame
tf.text = "First bullet"
p = tf.add_paragraph()
p.text = "Second bullet"
p.level = 1

prs.save('/home/user/output/output.pptx')
\`\`\`

## Adding Images

\`\`\`python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
slide.shapes.add_picture(
    'image.png',
    left=Inches(1),
    top=Inches(1),
    width=Inches(5)
)
\`\`\`

## Adding Tables

\`\`\`python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[6])
table = slide.shapes.add_table(
    rows=3, cols=3,
    left=Inches(1), top=Inches(1),
    width=Inches(8), height=Inches(2)
).table

# Set cell values
table.cell(0, 0).text = "Header 1"
table.cell(0, 1).text = "Header 2"
table.cell(1, 0).text = "Data 1"
\`\`\`

## Adding Charts

\`\`\`python
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
from pptx.util import Inches

chart_data = CategoryChartData()
chart_data.categories = ['East', 'West', 'Midwest']
chart_data.add_series('Series 1', (19.2, 21.4, 16.7))

slide = prs.slides.add_slide(prs.slide_layouts[6])
chart = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(1), Inches(1), Inches(8), Inches(5),
    chart_data
).chart
\`\`\`

## Using Scripts

### Generate Thumbnails
\`\`\`bash
python /home/user/scripts/pptx/thumbnail.py presentation.pptx ./thumbnails/
# Creates: thumbnails/slide_1.png, slide_2.png, etc.
\`\`\`

### Get Slide Inventory
\`\`\`bash
python /home/user/scripts/pptx/inventory.py presentation.pptx
# Returns JSON with all slide content and shapes
\`\`\`

### Reorder Slides
\`\`\`bash
# Order: [3, 1, 2] means slide 3 becomes first, slide 1 second, etc.
python /home/user/scripts/pptx/rearrange.py input.pptx '[3, 1, 2]' output.pptx
\`\`\`

### Find and Replace Text
\`\`\`bash
python /home/user/scripts/pptx/replace.py input.pptx '{"{{company}}": "Acme Corp", "{{date}}": "2024"}' output.pptx
\`\`\`

## Template Processing Workflow

1. **Generate thumbnails** to understand slide structure:
   \`\`\`bash
   python /home/user/scripts/pptx/thumbnail.py template.pptx ./preview/
   \`\`\`

2. **Get inventory** to find placeholder text:
   \`\`\`bash
   python /home/user/scripts/pptx/inventory.py template.pptx
   \`\`\`

3. **Replace placeholders**:
   \`\`\`bash
   python /home/user/scripts/pptx/replace.py template.pptx '{"{{title}}": "Q4 Report"}' output.pptx
   \`\`\`

## Quick Reference

| Task | Tool | Example |
|------|------|---------|
| Read presentation | python-pptx | \`Presentation('file.pptx')\` |
| Create presentation | python-pptx | \`Presentation()\` |
| Add slide | python-pptx | \`prs.slides.add_slide(layout)\` |
| Generate thumbnails | script | \`python thumbnail.py pres.pptx ./out/\` |
| Get slide inventory | script | \`python inventory.py pres.pptx\` |
| Reorder slides | script | \`python rearrange.py pres.pptx '[2,1,3]' out.pptx\` |
| Find/replace | script | \`python replace.py pres.pptx '{...}' out.pptx\` |`,
};
