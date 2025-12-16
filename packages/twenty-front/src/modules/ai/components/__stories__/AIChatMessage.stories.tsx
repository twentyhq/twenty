import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const StyledConversationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 700px;
  padding: 24px;
`;

// Mock messages for the conversation showcase
const mockUserMessage: ExtendedUIMessage = {
  id: 'msg-user-1',
  role: 'user',
  parts: [
    {
      type: 'text',
      text: 'Can you analyze my sales data and create a chart showing the monthly trends?',
    },
  ],
  metadata: {
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
};

const mockAssistantWithCodeExecution: ExtendedUIMessage = {
  id: 'msg-assistant-1',
  role: 'assistant',
  parts: [
    {
      type: 'data-code-execution',
      data: {
        executionId: 'exec-1',
        state: 'completed',
        code: `import pandas as pd
import matplotlib.pyplot as plt

# Load and process sales data
data = {
    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    'sales': [12500, 15200, 14800, 18900, 21000, 19500]
}
df = pd.DataFrame(data)

# Create the chart
plt.figure(figsize=(10, 6))
plt.bar(df['month'], df['sales'], color='steelblue')
plt.title('Monthly Sales Trends')
plt.xlabel('Month')
plt.ylabel('Sales ($)')
plt.savefig('sales_chart.png', dpi=150)
print(f"Total sales: $" + str(df['sales'].sum()))
print("Chart saved successfully!")`,
        language: 'python',
        stdout: 'Total sales: $101,900\nChart saved successfully!',
        stderr: '',
        exitCode: 0,
        executionTimeMs: 2340,
        files: [
          {
            filename: 'sales_chart.png',
            url: 'https://picsum.photos/800/480',
            mimeType: 'image/png',
          },
        ],
      },
    },
    {
      type: 'text',
      text: "I've analyzed your sales data and created a chart showing the monthly trends. Here are the key insights:\n\n- **Total sales**: $101,900 over 6 months\n- **Peak month**: May with $21,000 in sales\n- **Growth trend**: Overall positive trajectory with 68% growth from January to May\n\nThe chart shows a clear upward trend with a slight dip in March. Would you like me to perform any additional analysis?",
    },
  ],
  metadata: {
    createdAt: new Date(Date.now() - 60000).toISOString(),
    usage: {
      inputTokens: 1250,
      outputTokens: 890,
      inputCredits: 12,
      outputCredits: 8,
    },
  },
};

const mockSimpleTextResponse: ExtendedUIMessage = {
  id: 'msg-assistant-text',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: "Hello! I'm your AI assistant. I can help you with:\n\n- **Data analysis** - Analyze your CRM data and generate insights\n- **Code execution** - Run Python code for complex calculations\n- **Record management** - Create, update, or find records\n\nHow can I assist you today?",
    },
  ],
  metadata: {
    createdAt: new Date().toISOString(),
  },
};

const mockStreamingMessage: ExtendedUIMessage = {
  id: 'msg-streaming',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: 'Let me look into that for you',
    },
  ],
  metadata: {
    createdAt: new Date().toISOString(),
  },
};

const mockCodeExecutionRunning: ExtendedUIMessage = {
  id: 'msg-code-running',
  role: 'assistant',
  parts: [
    {
      type: 'data-code-execution',
      data: {
        executionId: 'exec-running',
        state: 'running',
        code: `import time
print("Processing data...")
time.sleep(5)
print("Done!")`,
        language: 'python',
        stdout: 'Processing data...',
        stderr: '',
        files: [],
      },
    },
  ],
  metadata: {
    createdAt: new Date().toISOString(),
  },
};

const mockCodeExecutionError: ExtendedUIMessage = {
  id: 'msg-code-error',
  role: 'assistant',
  parts: [
    {
      type: 'data-code-execution',
      data: {
        executionId: 'exec-error',
        state: 'error',
        code: `import pandas as pd
df = pd.read_csv('missing_file.csv')
print(df.head())`,
        language: 'python',
        stdout: '',
        stderr:
          "FileNotFoundError: [Errno 2] No such file or directory: 'missing_file.csv'",
        exitCode: 1,
        files: [],
        error: 'File not found',
      },
    },
    {
      type: 'text',
      text: "I encountered an error while trying to read the file. It looks like the file `missing_file.csv` doesn't exist. Could you please check the file path or upload the file you'd like me to analyze?",
    },
  ],
  metadata: {
    createdAt: new Date().toISOString(),
  },
};

const meta: Meta<typeof AIChatMessage> = {
  title: 'Modules/AI/AIChatMessage',
  component: AIChatMessage,
  decorators: [
    ComponentDecorator,
    RootDecorator,
    I18nFrontDecorator,
    SnackBarDecorator,
  ],
  parameters: {
    container: { width: 700 },
  },
};

export default meta;
type Story = StoryObj<typeof AIChatMessage>;

// Conversation showcase - demonstrates a full AI chat flow
export const ConversationWithCodeExecution: Story = {
  render: () => (
    <StyledConversationContainer>
      <AIChatMessage message={mockUserMessage} isLastMessageStreaming={false} />
      <AIChatMessage
        message={mockAssistantWithCodeExecution}
        isLastMessageStreaming={false}
      />
    </StyledConversationContainer>
  ),
};

export const UserMessage: Story = {
  args: {
    message: mockUserMessage,
    isLastMessageStreaming: false,
  },
};

export const AssistantTextResponse: Story = {
  args: {
    message: mockSimpleTextResponse,
    isLastMessageStreaming: false,
  },
};

export const AssistantStreaming: Story = {
  args: {
    message: mockStreamingMessage,
    isLastMessageStreaming: true,
  },
};

export const CodeExecutionRunning: Story = {
  args: {
    message: mockCodeExecutionRunning,
    isLastMessageStreaming: false,
  },
};

export const CodeExecutionWithError: Story = {
  args: {
    message: mockCodeExecutionError,
    isLastMessageStreaming: false,
  },
};
