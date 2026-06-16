import { isNonEmptyString, isObject } from '@sniptt/guards';

const toNonEmptyStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter(isNonEmptyString) : [];

export const getLearntToolNames = (input: unknown): string[] =>
  isObject(input) && 'toolNames' in input
    ? toNonEmptyStringArray(input.toolNames)
    : [];

export const getLoadedSkillNames = (input: unknown): string[] =>
  isObject(input) && 'skillNames' in input
    ? toNonEmptyStringArray(input.skillNames)
    : [];
