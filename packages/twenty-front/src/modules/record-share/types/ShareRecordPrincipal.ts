import { type ShareWithInput } from '~/generated-metadata/graphql';

export type ShareRecordPrincipal = {
  label: string;
  shareWith: Pick<ShareWithInput, 'workspaceMemberId' | 'roleId' | 'everyone'>;
};
