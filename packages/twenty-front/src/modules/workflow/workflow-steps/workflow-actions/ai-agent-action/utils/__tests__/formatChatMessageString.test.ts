import { formatChatMessageDate } from '../formatChatMessageString';

describe('formatChatMessageDate', () => {
  it('should format ISO date string to a readable format', () => {
    const input = '2023-07-01T14:30:00Z';
    const result = formatChatMessageDate(input);
    expect(result).toContain('2023');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('should format today\'s date as "Today at HH:mm"', () => {
    const now = new Date();
    const iso = now.toISOString();
    const result = formatChatMessageDate(iso);
    expect(result).toMatch(/Today/i);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('should format yesterday\'s date as "Yesterday at HH:mm"', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const iso = yesterday.toISOString();
    const result = formatChatMessageDate(iso);
    expect(result).toMatch(/Yesterday/i);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('should match the full expected string for a specific date', () => {
    const input = '2023-07-01T14:30:00Z';
    const result = formatChatMessageDate(input);
    expect(result).toBe('Jul 1, 2023 at 14:30');
  });
});
