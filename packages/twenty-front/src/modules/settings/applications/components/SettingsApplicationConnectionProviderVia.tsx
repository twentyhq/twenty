import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledVia = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

type SettingsApplicationConnectionProviderViaProps = {
  via: { name: string; description: string | null };
};

export const SettingsApplicationConnectionProviderVia = ({
  via: { name, description },
}: SettingsApplicationConnectionProviderViaProps) => {
  const { t } = useLingui();

  return (
    <Tooltip content={name} description={description}>
      <StyledVia>{t`via ${name}`}</StyledVia>
    </Tooltip>
  );
};
