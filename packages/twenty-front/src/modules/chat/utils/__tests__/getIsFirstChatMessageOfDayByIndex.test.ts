import { getIsFirstChatMessageOfDayByIndex } from '@/chat/utils/getIsFirstChatMessageOfDayByIndex';

describe('getIsFirstChatMessageOfDayByIndex', () => {
  it('marks the first message of each day', () => {
    expect(
      getIsFirstChatMessageOfDayByIndex([
        '2026-11-22',
        '2026-11-22',
        '2026-11-23',
      ]),
    ).toEqual([true, false, true]);
  });

  it('keeps an undated message in the day of the message before it', () => {
    expect(
      getIsFirstChatMessageOfDayByIndex([
        '2026-11-22',
        undefined,
        '2026-11-22',
        '2026-11-23',
      ]),
    ).toEqual([true, false, false, true]);
  });
});
