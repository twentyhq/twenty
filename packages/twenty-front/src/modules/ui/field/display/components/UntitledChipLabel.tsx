import { t } from '@lingui/core/macro';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

export const UntitledChipLabel = () => (
  <Text
    render={<span />}
    style={{ color: themeCssVariables.font.color.tertiary }}
  >
    {t`Untitled`}
  </Text>
);
