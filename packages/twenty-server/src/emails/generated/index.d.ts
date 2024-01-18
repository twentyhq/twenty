import * as react_jsx_runtime from 'react/jsx-runtime';

type CleanInactiveWorkspaceEmailData = {
    daysLeft: number;
    userName: string;
    workspaceDisplayName: string;
};
declare const CleanInactiveWorkspaceEmail: ({ daysLeft, userName, workspaceDisplayName, }: CleanInactiveWorkspaceEmailData) => react_jsx_runtime.JSX.Element;

type DeleteInactiveWorkspaceEmailData = {
    daysSinceDead: number;
    workspaceId: string;
};
declare const DeleteInactiveWorkspaceEmail: ({ daysSinceDead, workspaceId, }: DeleteInactiveWorkspaceEmailData) => react_jsx_runtime.JSX.Element;

export { CleanInactiveWorkspaceEmail, DeleteInactiveWorkspaceEmail };
