import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useIngestionPipelines } from '@/settings/ingestion-pipeline/hooks/useIngestionPipelines';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledTh = styled.th`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[2]};
  text-align: left;
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  font-size: ${themeCssVariables.font.size.md};
  cursor: pointer;
`;

const StyledModeTag = styled.span<{ mode: string }>`
  background: ${({ mode }) =>
    mode === 'push'
      ? themeCssVariables.color.blue10
      : themeCssVariables.color.green10};
  color: ${({ mode }) =>
    mode === 'push'
      ? themeCssVariables.color.blue
      : themeCssVariables.color.green};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-transform: uppercase;
`;

const StyledStatusDot = styled.span<{ isEnabled: boolean }>`
  background: ${({ isEnabled }) =>
    isEnabled
      ? themeCssVariables.color.green
      : themeCssVariables.font.color.light};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-right: ${themeCssVariables.spacing[1]};
  width: 8px;
`;

export const SettingsIngestionPipelines = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pipelines, loading } = useIngestionPipelines();

  return (
    <SubMenuTopBarContainer
      title={t`Ingestion Pipelines`}
      actionButton={
        <Button
          Icon={IconPlus}
          title={t`New pipeline`}
          size="small"
          variant="secondary"
          onClick={() =>
            navigate(getSettingsPath(SettingsPath.NewIngestionPipeline))
          }
        />
      }
      links={[
        { children: <Trans>Settings</Trans>, href: '/settings' },
        { children: <Trans>Ingestion Pipelines</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Pipelines`}
            description={t`Configure data ingestion pipelines to sync external data into your CRM`}
          />
          {loading ? (
            <div>
              <Trans>Loading...</Trans>
            </div>
          ) : pipelines.length === 0 ? (
            <div>
              <Trans>
                No pipelines configured yet. Create one to start ingesting data.
              </Trans>
            </div>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <StyledTh>
                    <Trans>Name</Trans>
                  </StyledTh>
                  <StyledTh>
                    <Trans>Mode</Trans>
                  </StyledTh>
                  <StyledTh>
                    <Trans>Target Object</Trans>
                  </StyledTh>
                  <StyledTh>
                    <Trans>Status</Trans>
                  </StyledTh>
                </tr>
              </thead>
              <tbody>
                {pipelines.map((pipeline) => (
                  <tr
                    key={pipeline.id}
                    onClick={() =>
                      navigate(
                        getSettingsPath(SettingsPath.IngestionPipelineDetail, {
                          pipelineId: pipeline.id,
                        }),
                      )
                    }
                  >
                    <StyledTd>{pipeline.name}</StyledTd>
                    <StyledTd>
                      <StyledModeTag mode={pipeline.mode}>
                        {pipeline.mode}
                      </StyledModeTag>
                    </StyledTd>
                    <StyledTd>{pipeline.targetObjectNameSingular}</StyledTd>
                    <StyledTd>
                      <StyledStatusDot isEnabled={pipeline.isEnabled} />
                      {pipeline.isEnabled ? t`Active` : t`Inactive`}
                    </StyledTd>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
