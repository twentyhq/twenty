import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CodeExecutionDisplay } from '@/ai/components/CodeExecutionDisplay';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const samplePythonCode = `import pandas as pd
import matplotlib.pyplot as plt

# Create sample data
data = {
    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    'revenue': [12500, 15200, 14800, 18900, 21000, 19500]
}
df = pd.DataFrame(data)

# Calculate statistics
total = df['revenue'].sum()
average = df['revenue'].mean()
print(f"Total Revenue: $" + f"{total:,.2f}")
print(f"Average Monthly: $" + f"{average:,.2f}")

# Generate chart
plt.figure(figsize=(10, 6))
plt.bar(df['month'], df['revenue'], color='steelblue')
plt.title('Monthly Revenue')
plt.savefig('revenue_chart.png')`;

const meta: Meta<typeof CodeExecutionDisplay> = {
  title: 'Modules/AI/CodeExecutionDisplay',
  component: CodeExecutionDisplay,
  decorators: [I18nFrontDecorator, SnackBarDecorator, ComponentDecorator],
  parameters: {
    container: { width: 600 },
  },
  args: {
    code: samplePythonCode,
    stdout: '',
    stderr: '',
    isRunning: false,
  },
};

export default meta;
type Story = StoryObj<typeof CodeExecutionDisplay>;

export const Running: Story = {
  args: {
    code: `print("Processing data...")
import time
time.sleep(5)
print("Complete!")`,
    stdout: 'Processing data...',
    stderr: '',
    isRunning: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Running...')).toBeVisible();
  },
};

export const Success: Story = {
  args: {
    code: samplePythonCode,
    stdout: 'Total Revenue: $101,900.00\nAverage Monthly: $16,983.33',
    stderr: '',
    exitCode: 0,
    isRunning: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Completed')).toBeVisible();
    // Output content is inside a scrollable container
    expect(await canvas.findByText(/Total Revenue/)).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: {
    code: `import pandas as pd
df = pd.read_csv('missing_file.csv')
print(df.head())`,
    stdout: '',
    stderr:
      'Traceback (most recent call last):\n  File "<stdin>", line 2, in <module>\nFileNotFoundError: [Errno 2] No such file or directory: \'missing_file.csv\'',
    exitCode: 1,
    isRunning: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Failed')).toBeVisible();
  },
};

export const WithImageFiles: Story = {
  args: {
    code: samplePythonCode,
    stdout: 'Chart generated successfully!',
    stderr: '',
    exitCode: 0,
    isRunning: false,
    files: [
      {
        filename: 'revenue_chart.png',
        url: 'https://picsum.photos/800/480',
        mimeType: 'image/png',
      },
      {
        filename: 'pie_chart.png',
        url: 'https://picsum.photos/600/400',
        mimeType: 'image/png',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Text includes file count: "Generated Files (2)"
    expect(await canvas.findByText(/Generated Files/)).toBeInTheDocument();
    // Filenames may be truncated, check by title attribute
    expect(await canvas.findByTitle('revenue_chart.png')).toBeInTheDocument();
    expect(await canvas.findByTitle('pie_chart.png')).toBeInTheDocument();
  },
};

export const WithDownloadableFiles: Story = {
  args: {
    code: `import pandas as pd

df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'sales': [1200, 1500, 980]
})

df.to_csv('report.csv', index=False)
df.to_json('data.json')
print("Files exported successfully!")`,
    stdout: 'Files exported successfully!',
    stderr: '',
    exitCode: 0,
    isRunning: false,
    files: [
      {
        filename: 'report.csv',
        url: 'data:text/csv,name%2Csales%0AAlice%2C1200%0ABob%2C1500',
        mimeType: 'text/csv',
      },
      {
        filename: 'data.json',
        url: 'data:application/json,%7B%22name%22%3A%5B%22Alice%22%5D%7D',
        mimeType: 'application/json',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Filenames may be truncated, check by title attribute
    expect(await canvas.findByTitle('report.csv')).toBeInTheDocument();
    expect(await canvas.findByTitle('data.json')).toBeInTheDocument();
  },
};

export const CodeSectionExpanded: Story = {
  args: {
    code: samplePythonCode,
    stdout: 'Total Revenue: $101,900.00',
    stderr: '',
    exitCode: 0,
    isRunning: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click to expand the code section
    const codeHeader = await canvas.findByText('Code');
    await userEvent.click(codeHeader);

    // The code editor should now be visible
    expect(await canvas.findByText('Completed')).toBeVisible();
  },
};

export const EmptyOutput: Story = {
  args: {
    code: `x = 1 + 1
y = x * 2
# No print statements`,
    stdout: '',
    stderr: '',
    exitCode: 0,
    isRunning: false,
  },
};

export const LongOutput: Story = {
  args: {
    code: `for i in range(50):
    print(f"Processing item {i+1}...")`,
    stdout: Array.from(
      { length: 50 },
      (_, i) => `Processing item ${i + 1}...`,
    ).join('\n'),
    stderr: '',
    exitCode: 0,
    isRunning: false,
  },
};
