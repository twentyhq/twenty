import { applySerializedEventProperties } from '@/remote/elements/utils/applySerializedEventProperties';

describe('applySerializedEventProperties', () => {
  it('should define the serialized properties on a custom event', () => {
    const event = new CustomEvent('click', { detail: { type: 'click' } });

    applySerializedEventProperties(
      event as unknown as Record<string, unknown>,
      { type: 'click', detail: 2, clientX: 10 },
    );

    expect(event.detail).toBe(2);
    expect((event as unknown as Record<string, unknown>).clientX).toBe(10);
  });
});
