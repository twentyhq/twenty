import { MergeRecordsContentScrollResetEffect } from '@/object-record/record-merge/components/MergeRecordsContentScrollResetEffect';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const MergeRecordsContentScrollResetEffectStory = () => {
  const [activeTabId, setActiveTabId] = useState('record-a');
  const contentContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button onClick={() => setActiveTabId('record-b')}>Switch tab</button>
      <div
        aria-label="Merge content"
        ref={contentContainerRef}
        role="region"
        style={{ height: 100, overflowY: 'auto' }}
      >
        <div style={{ height: 500 }}>Merge fields</div>
      </div>
      <MergeRecordsContentScrollResetEffect
        activeTabId={activeTabId}
        contentContainerRef={contentContainerRef}
      />
    </>
  );
};

const meta: Meta<typeof MergeRecordsContentScrollResetEffectStory> = {
  title:
    'Modules/ObjectRecord/RecordMerge/MergeRecordsContentScrollResetEffect',
  component: MergeRecordsContentScrollResetEffectStory,
};

export default meta;
type Story = StoryObj<typeof MergeRecordsContentScrollResetEffectStory>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const contentContainer = canvas.getByRole('region', {
      name: 'Merge content',
    });

    contentContainer.scrollTop = 200;
    await userEvent.click(canvas.getByRole('button', { name: 'Switch tab' }));

    await waitFor(() => expect(contentContainer.scrollTop).toBe(0));
  },
};
