import { AppPath, navigate } from 'twenty-sdk/front-component';

import { MY_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/my-applications.view';
import { OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/opportunity/views/open-briefs.view';

export type PlaybookNavAction = 'openBriefs' | 'myApplications';

export type PlaybookLink =
  | { label: string; href: string }
  | { label: string; action: PlaybookNavAction };

export const runPlaybookNav = async (action: PlaybookNavAction) => {
  switch (action) {
    case 'openBriefs': {
      await navigate(
        AppPath.RecordIndexPage,
        { objectNamePlural: 'opportunities' },
        { viewId: OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER },
      );
      return;
    }
    case 'myApplications': {
      await navigate(
        AppPath.RecordIndexPage,
        { objectNamePlural: 'applications' },
        { viewId: MY_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER },
      );
      return;
    }
  }
};
