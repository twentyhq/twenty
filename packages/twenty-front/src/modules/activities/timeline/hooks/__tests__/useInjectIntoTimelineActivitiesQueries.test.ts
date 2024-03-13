import { renderHook } from '@testing-library/react';

import { useInjectIntoActivitiesQueries } from '@/activities/hooks/useInjectIntoActivitiesQueries';
import { useInjectIntoTimelineActivitiesQueries } from '@/activities/timeline/hooks/useInjectIntoTimelineActivitiesQueries';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

jest.mock('@/activities/hooks/useInjectIntoActivitiesQueries', () => ({
  useInjectIntoActivitiesQueries: jest.fn(() => ({
    injectActivitiesQueries: jest.fn(),
  })),
}));

describe('useInjectIntoTimelineActivitiesQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should inject activities into timeline activities queries correctly', () => {
    const mockActivityToInject: Activity = {
      id: 'activity1',
      createdAt: '2022-01-01T00:00:00',
      updatedAt: '2022-01-01T00:00:00',
      completedAt: '2022-01-01T00:00:00',
      __typename: 'Activity',
      reminderAt: '2022-01-01T00:00:00',
      dueAt: '2022-01-01T00:00:00',
      type: 'Task',
      activityTargets: [],
      title: 'Activity 1',
      body: 'Activity 1 body',
      author: {
        id: 'author1',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
        avatarUrl: 'https://example.com/avatar1.jpg',
      },
      authorId: 'author1',
      assignee: null,
      assigneeId: null,
      comments: [],
    };
    const mockActivityTargetsToInject: ActivityTarget[] = [
      {
        id: 'target1',
        updatedAt: '2022-01-01T00:00:00',
        createdAt: '2022-01-01T00:00:00',
        activity: {
          id: 'activity1',
          createdAt: '2022-01-01T00:00:00',
          updatedAt: '2022-01-01T00:00:00',
        },
      },
      {
        id: 'target2',
        updatedAt: '2022-01-01T00:00:00',
        createdAt: '2022-01-01T00:00:00',
        activity: {
          id: 'activity1',
          createdAt: '2022-01-01T00:00:00',
          updatedAt: '2022-01-01T00:00:00',
        },
      },
    ];
    const mockTimelineTargetableObject: ActivityTargetableObject = {
      id: 'timelineTarget1',
      targetObjectNameSingular: 'Timeline',
    };

    const { result } = renderHook(() =>
      useInjectIntoTimelineActivitiesQueries(),
    );

    result.current.injectIntoTimelineActivitiesQueries({
      activityToInject: mockActivityToInject,
      activityTargetsToInject: mockActivityTargetsToInject,
      timelineTargetableObject: mockTimelineTargetableObject,
    });

    expect(useInjectIntoActivitiesQueries).toHaveBeenCalledTimes(1);
  });
});
