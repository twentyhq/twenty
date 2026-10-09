import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

export const getChipLabel = (value: string | null | undefined) => {
  if (isNonEmptyString(value)) {
    return { text: value, content: value };
  }

  const text = t`Untitled`;

  return {
    text,
    content: (
      <Text
        render={<span />}
        style={{ color: themeCssVariables.font.color.tertiary }}
      >
        {text}
      </Text>
    ),
  };
};
