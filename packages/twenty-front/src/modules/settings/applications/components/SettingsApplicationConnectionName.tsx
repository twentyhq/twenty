import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHandle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  margin-left: ${themeCssVariables.spacing[1]};
`;

type SettingsApplicationConnectionNameProps = {
  connection: { name?: string | null; handle: string };
};

export const SettingsApplicationConnectionName = ({
  connection: { name, handle },
}: SettingsApplicationConnectionNameProps) => {
  if (!isNonEmptyString(name) || name === handle) {
    return handle;
  }

  return (
    <>
      {name}
      <StyledHandle>{handle}</StyledHandle>
    </>
  );
};
