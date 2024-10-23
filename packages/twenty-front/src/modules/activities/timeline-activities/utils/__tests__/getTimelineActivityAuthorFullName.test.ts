import { TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { getTimelineActivityAuthorFullName } from '@/activities/timeline-activities/utils/getTimelineActivityAuthorFullName';
import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';

describe('getTimelineActivityAuthorFullName', () => {
  it('should return "You" if the current workspace member is the author', () => {
    const event = {
      workspaceMember: {
        id: '123',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    };
    const currentWorkspaceMember = {
      id: '123',
    };

    const result = getTimelineActivityAuthorFullName(
      event as TimelineActivity,
      currentWorkspaceMember as CurrentWorkspaceMember,
    );

    expect(result).toBe('You');
  });

  it('should return the full name of the workspace member if they are not the current workspace member', () => {
    const event = {
      workspaceMember: {
        id: '456',
        name: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
      },
    };
    const currentWorkspaceMember = {
      id: '123',
    };

    const result = getTimelineActivityAuthorFullName(
      event as TimelineActivity,
      currentWorkspaceMember as CurrentWorkspaceMember,
    );

    expect(result).toBe('Jane Smith');
  });

  it('should return "Twenty" if the workspace member is not defined', () => {
    const event = {};
    const currentWorkspaceMember = {
      id: '123',
    };

    const result = getTimelineActivityAuthorFullName(
      event as TimelineActivity,
      currentWorkspaceMember as CurrentWorkspaceMember,
    );

    expect(result).toBe('Twenty');
  });
});
