import { type SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';

export const CODE_INTERPRETER_SKILL: SkillDefinition = {
  name: 'code-interpreter',
  label: 'Code Interpreter',
  description:
    'Data analysis, CSV processing, and chart generation using Python',
  content: `# Code Interpreter Skill

You have access to the \`code_interpreter\` tool to execute Python code in a sandboxed environment.

**IMPORTANT**: Always use the \`code_interpreter\` tool to run Python code. Do NOT use http_request or any other tool.

## How to Use
Call the \`code_interpreter\` tool with your Python code. The tool will execute the code and return stdout, stderr, and any generated files.

## Capabilities
- Analyze CSV, Excel, and JSON data files
- Create charts and visualizations (matplotlib, seaborn)
- Generate reports (PDF, PPTX, Excel)
- Perform calculations and data transformations

## Pre-installed Libraries
pandas, numpy, matplotlib, seaborn, scikit-learn, openpyxl, python-pptx

## Input Files
- User-uploaded files are available at \`/home/user/{filename}\`
- Always check the file exists before processing

## Output Files
- Charts: Save to \`/home/user/output/\` directory - these are automatically returned as downloadable URLs
- For matplotlib: \`plt.savefig('/home/user/output/chart.png')\`
- Generated files: Save to \`/home/user/output/{filename}\`

## Example: Create a Bar Chart
\`\`\`python
import matplotlib.pyplot as plt
import os

# Data
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
sales = [100, 150, 200, 175, 250, 300]

# Create chart
plt.figure(figsize=(10, 6))
plt.bar(months, sales, color='skyblue')
plt.title('Monthly Sales')
plt.xlabel('Month')
plt.ylabel('Sales')
plt.tight_layout()

# Save to output directory
os.makedirs('/home/user/output', exist_ok=True)
plt.savefig('/home/user/output/sales_chart.png')
print('Chart saved!')
\`\`\`

## Example: Analyze CSV
\`\`\`python
import pandas as pd
import matplotlib.pyplot as plt
import os

# Load data
df = pd.read_csv('/home/user/data.csv')
print(f"Loaded {len(df)} rows")

# Create visualization
plt.figure(figsize=(10, 6))
df.groupby('category')['value'].mean().plot(kind='bar')
plt.title('Average Value by Category')
plt.tight_layout()

os.makedirs('/home/user/output', exist_ok=True)
plt.savefig('/home/user/output/analysis.png')
print('Analysis complete!')
\`\`\``,
};
