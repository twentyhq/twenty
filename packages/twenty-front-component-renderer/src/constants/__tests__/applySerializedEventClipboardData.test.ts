import { applySerializedEventClipboardData } from '@/constants/applySerializedEventClipboardData';

type SynthesizedClipboardData = {
  types: string[];
  getData: (format: string) => string;
  setData: (format: string, data: string) => void;
};

const applyToEvent = (eventData: {
  type: string;
  clipboardText?: string;
}): SynthesizedClipboardData | undefined => {
  const event: Record<string, unknown> = {};
  applySerializedEventClipboardData(event, eventData);
  return event.clipboardData as SynthesizedClipboardData | undefined;
};

describe('applySerializedEventClipboardData', () => {
  it('should expose the pasted text through getData on a paste event', () => {
    const clipboardData = applyToEvent({
      type: 'paste',
      clipboardText: 'pasted text',
    });

    expect(clipboardData?.getData('text')).toBe('pasted text');
    expect(clipboardData?.getData('text/plain')).toBe('pasted text');
    expect(clipboardData?.types).toEqual(['text/plain']);
  });

  it('should return an empty string for other formats', () => {
    const clipboardData = applyToEvent({
      type: 'paste',
      clipboardText: 'pasted text',
    });

    expect(clipboardData?.getData('text/html')).toBe('');
  });

  it('should synthesize an empty clipboard for copy and cut events', () => {
    for (const type of ['copy', 'cut']) {
      const clipboardData = applyToEvent({ type });

      expect(clipboardData?.getData('text')).toBe('');
      expect(clipboardData?.types).toEqual([]);
      expect(clipboardData?.setData('text/plain', 'x')).toBeUndefined();
    }
  });

  it('should not synthesize clipboard data for other event types', () => {
    expect(applyToEvent({ type: 'input' })).toBeUndefined();
  });
});
