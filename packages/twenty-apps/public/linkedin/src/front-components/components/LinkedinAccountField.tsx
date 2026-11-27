import styled from '@emotion/styled';
import { useId } from 'react';
import { t } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme';
import { getPublicAssetUrl } from 'twenty-sdk/utils';

import { LinkedinHistoryImportStatus } from 'src/front-components/components/LinkedinHistoryImportStatus';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const StyledContainer = styled.div`
  border-bottom: 1px solid ${() => themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  padding-bottom: ${() => themeCssVariables.spacing[6]};
`;

const StyledLabel = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.xs};
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
`;

const StyledValue = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.font.color.primary};
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  height: ${() => themeCssVariables.spacing[8]};
  min-width: 0;
  padding: 0 ${() => themeCssVariables.spacing[2]};
`;

const StyledLogo = styled.img`
  flex-shrink: 0;
  height: ${() => themeCssVariables.spacing[4]};
  width: ${() => themeCssVariables.spacing[4]};
`;

const StyledText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledHandle = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
`;

const StyledStatus = styled.span`
  display: flex;
  flex-shrink: 0;
`;

type LinkedinAccountFieldProps = {
  name: string;
  handle: string;
  historyImport: LinkedinHistoryImportState | null;
  importProgress: number | undefined;
};

export const LinkedinAccountField = ({
  name,
  handle,
  historyImport,
  importProgress,
}: LinkedinAccountFieldProps) => {
  const labelId = useId();

  return (
    <StyledContainer>
      <StyledLabel id={labelId}>{t('Account')}</StyledLabel>
      <StyledValue aria-labelledby={labelId}>
        <StyledLogo src={getPublicAssetUrl('linkedin-logomark.svg')} alt="" />
        <StyledText>
          {name} <StyledHandle>· {handle}</StyledHandle>
        </StyledText>
        <StyledStatus>
          <LinkedinHistoryImportStatus
            historyImport={historyImport}
            progress={importProgress}
          />
        </StyledStatus>
      </StyledValue>
    </StyledContainer>
  );
};
