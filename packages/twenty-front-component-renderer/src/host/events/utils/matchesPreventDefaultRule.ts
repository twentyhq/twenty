const MODIFIER_FLAGS = ['alt', 'ctrl', 'meta', 'shift'] as const;

type ModifierFlag = (typeof MODIFIER_FLAGS)[number];

type EventLike = {
  type?: unknown;
  key?: unknown;
  altKey?: unknown;
  ctrlKey?: unknown;
  metaKey?: unknown;
  shiftKey?: unknown;
};

const isHeld = (event: EventLike, modifier: ModifierFlag): boolean =>
  event[`${modifier}Key` as keyof EventLike] === true;

/**
 * Does `rule` describe this event?
 *
 * A rule is `<type>` or `<type>:<combo>`, where the combo is a `key` value
 * optionally prefixed with modifiers — `submit`, `keydown:Enter`,
 * `keydown:Shift+Enter`. Modifier order does not matter, and the match on them
 * is exact: `keydown:Enter` is plain Enter and does not fire for Shift+Enter,
 * which is what lets a composer send on one and insert a newline on the other.
 */
export const matchesPreventDefaultRule = (
  rule: string,
  event: EventLike,
): boolean => {
  const separatorIndex = rule.indexOf(':');
  const type = separatorIndex === -1 ? rule : rule.slice(0, separatorIndex);

  if (type !== event.type) {
    return false;
  }

  if (separatorIndex === -1) {
    return true;
  }

  const parts = rule
    .slice(separatorIndex + 1)
    .split('+')
    .map((part) => part.trim())
    .filter((part) => part !== '');

  const key = parts.pop();

  if (key === undefined || key !== event.key) {
    return false;
  }

  const required = new Set(parts.map((part) => part.toLowerCase()));

  return MODIFIER_FLAGS.every(
    (modifier) => required.has(modifier) === isHeld(event, modifier),
  );
};
