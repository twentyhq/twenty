import * as React from 'react';
import { Column, Row, Section } from '@react-email/components';
import { BaseEmail } from 'src/components/BaseEmail';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type DeleteInactiveWorkspaceEmailData = {
  daysSinceInactive: number;
  workspaceId: string;
};

export const DeleteInactiveWorkspaceEmail = (
  workspacesToDelete: DeleteInactiveWorkspaceEmailData[],
) => {
  const minDaysSinceInactive = Math.min(
    ...workspacesToDelete.map(
      (workspaceToDelete) => workspaceToDelete.daysSinceInactive,
    ),
  );
  return (
    <BaseEmail width={350}>
      <Title value="Dead Workspaces 😵 that should be deleted" />
      <MainText>
        List of <b>workspaceIds</b> inactive since at least{' '}
        <b>{minDaysSinceInactive} days</b>:
        <Section>
          {workspacesToDelete.map((workspaceToDelete) => {
            return (
              <Row key={workspaceToDelete.workspaceId}>
                <Column>{workspaceToDelete.workspaceId}</Column>
              </Row>
            );
          })}
        </Section>
      </MainText>
    </BaseEmail>
  );
};

export default DeleteInactiveWorkspaceEmail;
