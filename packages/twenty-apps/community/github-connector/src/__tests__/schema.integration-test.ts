import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/modules/shared/universal-identifiers';
import { describe, expect, it } from 'vitest';

import { findInstalledApp, findObjectByName } from './helpers/metadata';

describe('App installation', () => {
  it('finds the installed GitHub Connector app', async () => {
    const app = await findInstalledApp(APPLICATION_UNIVERSAL_IDENTIFIER);
    expect(app).toBeDefined();
    expect(app?.name).toMatch(/github/i);
  });
});

describe('Contributor object', () => {
  it('exists with the expected GitHub-only fields', async () => {
    const obj = await findObjectByName('contributor');
    expect(obj).toBeDefined();

    const names = obj!.fields.edges.map((e) => e.node.name);
    expect(names).toContain('name');
    expect(names).toContain('ghLogin');
    expect(names).toContain('githubId');
    expect(names).toContain('avatarUrl');
    expect(names).toContain('contributions');

    expect(names).not.toContain('isCoreTeam');
    expect(names).not.toContain('discordId');
  });
});

describe('PullRequest object', () => {
  it('exists with the expected fields and relations', async () => {
    const obj = await findObjectByName('pullRequest');
    expect(obj).toBeDefined();

    const names = obj!.fields.edges.map((e) => e.node.name);
    expect(names).toContain('name');
    expect(names).toContain('githubNumber');
    expect(names).toContain('uniqueIdentifier');
    expect(names).toContain('url');
    expect(names).toContain('state');
    expect(names).toContain('mergedAt');
    expect(names).toContain('closedAt');
    expect(names).toContain('githubCreatedAt');
    expect(names).toContain('author');
    expect(names).toContain('merger');
    expect(names).toContain('reviews');
    expect(names).toContain('projectItems');
  });
});

describe('PullRequestReviewEvent object', () => {
  it('exists with the expected fields and relations', async () => {
    const obj = await findObjectByName('pullRequestReviewEvent');
    expect(obj).toBeDefined();

    const names = obj!.fields.edges.map((e) => e.node.name);
    expect(names).toContain('title');
    expect(names).toContain('githubReviewId');
    expect(names).toContain('state');
    expect(names).toContain('submittedAt');
    expect(names).toContain('reviewer');
    expect(names).toContain('pullRequest');
    expect(names).toContain('review');
  });
});

describe('PullRequestReview object', () => {
  it('exists with the expected fields and relations', async () => {
    const obj = await findObjectByName('pullRequestReview');
    expect(obj).toBeDefined();

    const names = obj!.fields.edges.map((e) => e.node.name);
    expect(names).toContain('title');
    expect(names).toContain('reviewKey');
    expect(names).toContain('state');
    expect(names).toContain('firstSubmittedAt');
    expect(names).toContain('lastSubmittedAt');
    expect(names).toContain('eventCount');
    expect(names).toContain('reviewer');
    expect(names).toContain('pullRequest');
    expect(names).toContain('reviewEvents');
  });
});

describe('Issue object', () => {
  it('exists with the expected fields and relations', async () => {
    const obj = await findObjectByName('issue');
    expect(obj).toBeDefined();

    const names = obj!.fields.edges.map((e) => e.node.name);
    expect(names).toContain('title');
    expect(names).toContain('githubNumber');
    expect(names).toContain('uniqueIdentifier');
    expect(names).toContain('githubUrl');
    expect(names).toContain('state');
    expect(names).toContain('labels');
    expect(names).toContain('githubCreatedAt');
    expect(names).toContain('closedAt');
    expect(names).toContain('repo');
    expect(names).toContain('author');
    expect(names).toContain('projectItems');
  });
});

describe('ProjectItem object', () => {
  it('exists with the expected fields and relations', async () => {
    const obj = await findObjectByName('projectItem');
    expect(obj).toBeDefined();

    const names = obj!.fields.edges.map((e) => e.node.name);
    expect(names).toContain('name');
    expect(names).toContain('githubProjectItemId');
    expect(names).toContain('status');
    expect(names).toContain('sprint');
    expect(names).toContain('assignees');
    expect(names).toContain('priority');
    expect(names).toContain('mainAssignee');
    expect(names).toContain('linkedIssue');
    expect(names).toContain('linkedPullRequest');
    expect(names).toContain('githubUrl');
    expect(names).toContain('repo');
  });
});
