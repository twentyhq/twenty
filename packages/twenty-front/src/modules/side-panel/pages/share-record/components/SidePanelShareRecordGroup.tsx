import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[5]};
  padding: 0 ${themeCssVariables.spacing[1]};
  user-select: none;
`;

type SidePanelShareRecordGroupProps = {
  heading: ReactNode;
  shouldHideHeading?: boolean;
  children: ReactNode;
};

export const SidePanelShareRecordGroup = ({
  heading,
  shouldHideHeading = false,
  children,
}: SidePanelShareRecordGroupProps) => (
  <>
    {!shouldHideHeading && (
      <StyledHeading>
        <Text size="xs" weight="semibold" color="light">
          {heading}
        </Text>
      </StyledHeading>
    )}
    {children}
  </>
);
