import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';

const PUBLISHING_PATH =
  DOCUMENTATION_PATHS.DEVELOPERS_EXTEND_APPS_OPERATIONS_PUBLISHING;
const CI_PUBLISHING_PATH = `${PUBLISHING_PATH}#ci-publishing`;

type ClaimErrorContent = {
  message: MessageDescriptor;
  docPath: string;
};

export const getClaimErrorContent = (code: string): ClaimErrorContent => {
  switch (code) {
    case 'PROVENANCE_NOT_FOUND':
      return {
        message: msg`No provenance attestation was found for this package. Publish it from GitHub Actions with npm trusted publishing, then try claiming again.`,
        docPath: CI_PUBLISHING_PATH,
      };
    case 'PROVENANCE_CHECK_UNAVAILABLE':
      return {
        message: msg`We could not reach the package registry to verify the package provenance. Please try again in a few minutes.`,
        docPath: CI_PUBLISHING_PATH,
      };
    case 'GITHUB_ORG_OWNERSHIP_REQUIRED':
      return {
        message: msg`Your GitHub account does not own the organization that publishes this package. If you are an owner, grant this app access to the organization on GitHub's authorization screen (Organization access section).`,
        docPath: CI_PUBLISHING_PATH,
      };
    case 'GITHUB_AUTH_FAILED':
      return {
        message: msg`GitHub authorization failed or was denied. Please connect your GitHub account again.`,
        docPath: CI_PUBLISHING_PATH,
      };
    case 'CLAIM_NOT_CONFIGURED':
      return {
        message: msg`Claiming is not configured on this server. Ask an administrator to set up the GitHub OAuth app.`,
        docPath: PUBLISHING_PATH,
      };
    case 'CLAIM_NOT_SUPPORTED':
      return {
        message: msg`Only applications published to npm can be claimed this way.`,
        docPath: PUBLISHING_PATH,
      };
    case 'APPLICATION_REGISTRATION_ALREADY_OWNED':
      return {
        message: msg`This application has already been claimed by a workspace.`,
        docPath: PUBLISHING_PATH,
      };
    case 'APPLICATION_REGISTRATION_NOT_FOUND':
      return {
        message: msg`This application could not be found. It may have been removed from the marketplace catalog.`,
        docPath: PUBLISHING_PATH,
      };
    default:
      return {
        message: msg`Could not complete the claim. Please try again.`,
        docPath: PUBLISHING_PATH,
      };
  }
};
