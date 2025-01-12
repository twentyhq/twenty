import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { z } from 'zod';
import { isDomain } from '~/utils/is-domain';

export const useValidateForm = () => {
  const validationSchema = (blocklist: BlocklistItem[]) =>
    z
      .object({
        emailOrDomain: z
          .string()
          .trim()
          .email('Invalid email or domain')
          .or(
            z
              .string()
              .refine(
                (value) => value.startsWith('@') && isDomain(value.slice(1)),
                'Invalid email or domain',
              ),
          )
          .refine(
            (value) => !blocklist.map((item) => item.handle).includes(value),
            'Email or domain is already in blocklist',
          ),
      })
      .required();

  return {
    validationSchema,
  };
};
