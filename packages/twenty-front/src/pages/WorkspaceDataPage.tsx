import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import {
  AppTooltip,
  Avatar,
  H1Title,
  H2Title,
  IconBuildingSkyscraper,
  Status,
  TooltipDelay
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledTextContainerWithEllipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledStatsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledStatCard = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.inverted};
`;

const StyledStatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledStatNumber = styled.div`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledStatLabel = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSection = styled(Section)`
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const WorkspaceDataPage = () => {
  const { t } = useLingui();
  const theme = useTheme();
  
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  
  const {
    records: workspaceMembers,
    loading,
  } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const getMemberStatus = (member: WorkspaceMember) => {
    if (member.userId) {
      return t`Ativo`;
    }
    return t`Inativo`;
  };

  const getMemberRole = (member: WorkspaceMember) => {
    // You can customize this based on your role system
    // For now, we'll use a simple role based on user status
    return member.userId ? t`Membro` : t`Convidado`;
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title={t`Dados do Workspace`} />
        <PageBody>
          <div>{t`Carregando...`}</div>
        </PageBody>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title={t`All People - ${workspaceMembers.length}`}
        Icon={IconBuildingSkyscraper}
      />
      <PageBody>
        <StyledSection>
          <H1Title title={t`Dados do Workspace`} />
          
          <StyledStatsContainer>
            <div>
                <p>Nome</p>
                <StyledStatCard>
                    <StyledStatLabel>{t`Nome do Workspace`}</StyledStatLabel>
                </StyledStatCard>
            </div>

            <div>
                <p>Quantidade de Usuários</p>
                <StyledStatCard>
                    <StyledStatLabel>{workspaceMembers.length}</StyledStatLabel>
                </StyledStatCard>
            </div>
          </StyledStatsContainer>

          {/* Users List */}
          <H2Title title={t`Lista de Usuários`} />
          
          <Table>
            <TableRow gridAutoColumns="200px 150px 250px 100px">
              <TableHeader>
                <Trans>Nome</Trans>
              </TableHeader>
              <TableHeader>
                <Trans>Função</Trans>
              </TableHeader>
              <TableHeader>
                <Trans>Email</Trans>
              </TableHeader>
              <TableHeader>
                <Trans>Status</Trans>
              </TableHeader>
            </TableRow>
            
            {workspaceMembers.map((member) => (
              <TableRow key={member.id} gridAutoColumns="200px 150px 250px 100px">
                <TableCell>
                  <StyledIconWrapper>
                    <Avatar
                      avatarUrl={member.avatarUrl}
                      placeholderColorSeed={member.id}
                      placeholder={member.name.firstName ?? ''}
                      type="rounded"
                      size="sm"
                    />
                  </StyledIconWrapper>
                  <StyledTextContainerWithEllipsis
                    id={`member-name-${member.id}`}
                  >
                    {`${member.name.firstName} ${member.name.lastName}`}
                  </StyledTextContainerWithEllipsis>
                  <AppTooltip
                    anchorSelect={`#member-name-${member.id}`}
                    content={`${member.name.firstName} ${member.name.lastName}`}
                    noArrow
                    place="top"
                    positionStrategy="fixed"
                    delay={TooltipDelay.shortDelay}
                  />
                </TableCell>
                
                <TableCell>
                  <StyledTextContainerWithEllipsis>
                    {getMemberRole(member)}
                  </StyledTextContainerWithEllipsis>
                </TableCell>
                
                <TableCell>
                  <StyledTextContainerWithEllipsis>
                    {member.userEmail}
                  </StyledTextContainerWithEllipsis>
                </TableCell>
                
                <TableCell>
                  <Status
                    color={member.userId ? 'green' : 'gray'}
                    text={getMemberStatus(member)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </StyledSection>
      </PageBody>
    </PageContainer>
  );
};