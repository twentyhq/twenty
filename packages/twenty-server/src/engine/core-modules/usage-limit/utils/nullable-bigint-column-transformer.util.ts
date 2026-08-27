import { isString } from '@sniptt/guards';

export const nullableBigintColumnTransformer = {
  to: (value: number | null) => value,
  from: (value: string | number | null) =>
    isString(value) ? Number(value) : value,
};
