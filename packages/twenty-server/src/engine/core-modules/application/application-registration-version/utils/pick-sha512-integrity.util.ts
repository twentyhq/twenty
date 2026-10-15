export const pickSha512Integrity = (integrity: string | null): string | null =>
  integrity
    ?.split(/\s+/)
    .find((entry) => /^sha512-[A-Za-z0-9+/]{86}==$/.test(entry)) ?? null;
