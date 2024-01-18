import * as React from 'react';
import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { HighlightedText } from 'src/components/HighlightedText';
import { MainText } from 'src/components/MainText';
import { Title } from 'src/components/Title';

type DeleteInactiveWorkspaceEmailData = {
  daysSinceDead: number;
  workspaceId: string;
};

export const DeleteInactiveWorkspaceEmail = ({
  daysSinceDead,
  workspaceId,
}: DeleteInactiveWorkspaceEmailData) => {
  return (
    <BaseEmail>
      <Title value="Dead Workspace 😵" />
      <HighlightedText value={`Inactive since ${daysSinceDead} day(s)`} />
      <MainText>
        Workspace <b>{workspaceId}</b> should be deleted.
      </MainText>
      <CallToAction href="https://app.twenty.com" value="Connect to Twenty" />
    </BaseEmail>
  );
};

export default DeleteInactiveWorkspaceEmail;
