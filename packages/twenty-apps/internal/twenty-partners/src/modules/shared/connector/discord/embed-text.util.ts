import { type DiscordField } from 'src/modules/shared/connector/discord/types';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export const INLINE_MAX = 256;

export const truncate = (value: string, max: number): string =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;

export const trimTrailingSlash = (url: string): string =>
  url.replace(/\/+$/, '');

// Discord rejects the whole payload above 1024 chars per field; bound every
// inline value so one long record field cannot silently drop a notification.
export const inlineField = (
  name: string,
  value: string | undefined | null,
): DiscordField[] =>
  isNonEmptyString(value)
    ? [{ name, value: truncate(value.trim(), INLINE_MAX), inline: true }]
    : [];
