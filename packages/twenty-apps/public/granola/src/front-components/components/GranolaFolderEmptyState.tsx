import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { IconFolder } from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${() => themeCssVariables.font.size.sm};
  gap: ${() => themeCssVariables.spacing[2]};
  padding: ${() => themeCssVariables.spacing[8]};
  text-align: center;
`;

export const GranolaFolderEmptyState = () => (
  <StyledEmptyState>
    <IconFolder size={ICON.size.md} />
    <div>{t('No folders found for this key')}</div>
  </StyledEmptyState>
);
