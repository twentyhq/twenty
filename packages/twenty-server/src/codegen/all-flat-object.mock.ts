import { APIKEY_FLAT_OBJECT_MOCK } from './apikey-flat-object.mock';
import { ATTACHMENT_FLAT_OBJECT_MOCK } from './attachment-flat-object.mock';
import { BLOCKLIST_FLAT_OBJECT_MOCK } from './blocklist-flat-object.mock';
import { CALENDARCHANNEL_FLAT_OBJECT_MOCK } from './calendarchannel-flat-object.mock';
import { CALENDARCHANNELEVENTASSOCIATION_FLAT_OBJECT_MOCK } from './calendarchanneleventassociation-flat-object.mock';
import { CALENDAREVENT_FLAT_OBJECT_MOCK } from './calendarevent-flat-object.mock';
import { CALENDAREVENTPARTICIPANT_FLAT_OBJECT_MOCK } from './calendareventparticipant-flat-object.mock';
import { COMPANY_FLAT_OBJECT_MOCK } from './company-flat-object.mock';
import { CONNECTEDACCOUNT_FLAT_OBJECT_MOCK } from './connectedaccount-flat-object.mock';
import { FAVORITE_FLAT_OBJECT_MOCK } from './favorite-flat-object.mock';
import { FAVORITEFOLDER_FLAT_OBJECT_MOCK } from './favoritefolder-flat-object.mock';
import { MESSAGE_FLAT_OBJECT_MOCK } from './message-flat-object.mock';
import { MESSAGECHANNEL_FLAT_OBJECT_MOCK } from './messagechannel-flat-object.mock';
import { MESSAGECHANNELMESSAGEASSOCIATION_FLAT_OBJECT_MOCK } from './messagechannelmessageassociation-flat-object.mock';
import { MESSAGEFOLDER_FLAT_OBJECT_MOCK } from './messagefolder-flat-object.mock';
import { MESSAGEPARTICIPANT_FLAT_OBJECT_MOCK } from './messageparticipant-flat-object.mock';
import { MESSAGETHREAD_FLAT_OBJECT_MOCK } from './messagethread-flat-object.mock';
import { NOTE_FLAT_OBJECT_MOCK } from './note-flat-object.mock';
import { NOTETARGET_FLAT_OBJECT_MOCK } from './notetarget-flat-object.mock';
import { OPPORTUNITY_FLAT_OBJECT_MOCK } from './opportunity-flat-object.mock';
import { PERSON_FLAT_OBJECT_MOCK } from './person-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from './pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from './rocket-flat-object.mock';
import { SURVEYRESULT_FLAT_OBJECT_MOCK } from './surveyresult-flat-object.mock';
import { TASK_FLAT_OBJECT_MOCK } from './task-flat-object.mock';
import { TASKTARGET_FLAT_OBJECT_MOCK } from './tasktarget-flat-object.mock';
import { TIMELINEACTIVITY_FLAT_OBJECT_MOCK } from './timelineactivity-flat-object.mock';
import { VIEW_FLAT_OBJECT_MOCK } from './view-flat-object.mock';
import { VIEWFIELD_FLAT_OBJECT_MOCK } from './viewfield-flat-object.mock';
import { VIEWFILTER_FLAT_OBJECT_MOCK } from './viewfilter-flat-object.mock';
import { VIEWFILTERGROUP_FLAT_OBJECT_MOCK } from './viewfiltergroup-flat-object.mock';
import { VIEWGROUP_FLAT_OBJECT_MOCK } from './viewgroup-flat-object.mock';
import { VIEWSORT_FLAT_OBJECT_MOCK } from './viewsort-flat-object.mock';
import { WEBHOOK_FLAT_OBJECT_MOCK } from './webhook-flat-object.mock';
import { WORKFLOW_FLAT_OBJECT_MOCK } from './workflow-flat-object.mock';
import { WORKFLOWAUTOMATEDTRIGGER_FLAT_OBJECT_MOCK } from './workflowautomatedtrigger-flat-object.mock';
import { WORKFLOWRUN_FLAT_OBJECT_MOCK } from './workflowrun-flat-object.mock';
import { WORKFLOWVERSION_FLAT_OBJECT_MOCK } from './workflowversion-flat-object.mock';
import { WORKSPACEMEMBER_FLAT_OBJECT_MOCK } from './workspacemember-flat-object.mock';

export const ALL_FLAT_OBJECT_MOCKS_RECORD = {
  ATTACHMENT_FLAT_OBJECT_MOCK,
  NOTE_FLAT_OBJECT_MOCK,
  BLOCKLIST_FLAT_OBJECT_MOCK,
  CALENDAREVENT_FLAT_OBJECT_MOCK,
  CALENDARCHANNEL_FLAT_OBJECT_MOCK,
  CALENDARCHANNELEVENTASSOCIATION_FLAT_OBJECT_MOCK,
  CALENDAREVENTPARTICIPANT_FLAT_OBJECT_MOCK,
  COMPANY_FLAT_OBJECT_MOCK,
  CONNECTEDACCOUNT_FLAT_OBJECT_MOCK,
  FAVORITE_FLAT_OBJECT_MOCK,
  FAVORITEFOLDER_FLAT_OBJECT_MOCK,
  TIMELINEACTIVITY_FLAT_OBJECT_MOCK,
  VIEWFIELD_FLAT_OBJECT_MOCK,
  VIEW_FLAT_OBJECT_MOCK,
  VIEWGROUP_FLAT_OBJECT_MOCK,
  VIEWFILTER_FLAT_OBJECT_MOCK,
  VIEWFILTERGROUP_FLAT_OBJECT_MOCK,
  VIEWSORT_FLAT_OBJECT_MOCK,
  WORKFLOW_FLAT_OBJECT_MOCK,
  WORKFLOWVERSION_FLAT_OBJECT_MOCK,
  WORKFLOWRUN_FLAT_OBJECT_MOCK,
  WORKFLOWAUTOMATEDTRIGGER_FLAT_OBJECT_MOCK,
  WORKSPACEMEMBER_FLAT_OBJECT_MOCK,
  MESSAGETHREAD_FLAT_OBJECT_MOCK,
  MESSAGE_FLAT_OBJECT_MOCK,
  MESSAGECHANNEL_FLAT_OBJECT_MOCK,
  MESSAGEFOLDER_FLAT_OBJECT_MOCK,
  MESSAGEPARTICIPANT_FLAT_OBJECT_MOCK,
  MESSAGECHANNELMESSAGEASSOCIATION_FLAT_OBJECT_MOCK,
  NOTETARGET_FLAT_OBJECT_MOCK,
  OPPORTUNITY_FLAT_OBJECT_MOCK,
  PERSON_FLAT_OBJECT_MOCK,
  TASK_FLAT_OBJECT_MOCK,
  TASKTARGET_FLAT_OBJECT_MOCK,
  APIKEY_FLAT_OBJECT_MOCK,
  WEBHOOK_FLAT_OBJECT_MOCK,
  PET_FLAT_OBJECT_MOCK,
  ROCKET_FLAT_OBJECT_MOCK,
  SURVEYRESULT_FLAT_OBJECT_MOCK,
} as const;

export const ALL_FLAT_OBJECT_MOCKS_ARRAY = Object.values(
  ALL_FLAT_OBJECT_MOCKS_RECORD,
);
