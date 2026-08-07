import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPlaceholder = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

// An item with no subject has nothing to render underneath: the context bar
// above carries the whole of it.
export const SidePanelInboxItemPage = () => {
  const { t } = useLingui();

  return <StyledPlaceholder>{t`Nothing more to show`}</StyledPlaceholder>;
};
