import {
  AppPath,
  navigate,
  openSidePanelPage,
  SidePanelPages,
} from 'twenty-sdk/front-component';

import { APPLY_TO_BRIEF_FRONT_COMPONENT_ID } from 'src/modules/application/apply/constants/apply-to-brief.constants';
import { MY_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/my-applications.view';
import { OPEN_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/opportunity/views/open-briefs.view';

export type PlaybookNavAction = 'openBriefs' | 'myApplications' | 'apply';

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
    case 'apply': {
      await openSidePanelPage({
        page: SidePanelPages.ViewFrontComponent,
        frontComponentId: APPLY_TO_BRIEF_FRONT_COMPONENT_ID,
        objectNameSingular: 'opportunity',
        pageTitle: 'Apply to this brief',
        pageIcon: 'IconSend',
      });
      return;
    }
  }
};
