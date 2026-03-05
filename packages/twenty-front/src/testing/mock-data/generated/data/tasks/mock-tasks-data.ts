/* eslint-disable */
// @ts-nocheck
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

// This file was automatically generated — do not edit manually.

// prettier-ignore
export const mockedTaskRecords: ObjectRecord[] =
[
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": {
        "__typename": "FullName",
        "firstName": "Tim",
        "lastName": "Apple"
      }
    },
    "assigneeId": "20202020-0687-4c41-b707-ed1bfca972a7",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00b5-4a7c-8001-123456789aba",
            "name": "Product Photo.jpg"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-1\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Arrange a follow-up call to discuss project details and next steps.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Arrange a follow-up call to discuss project details and next steps."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-02T01:17:25.389Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0001-4e7c-8001-123456789def",
    "position": 1,
    "status": "TODO",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0001-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0001-4e7c-8001-123456789def",
              "title": "Schedule follow-up call"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000100000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-000015180001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Schedule follow-up call",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-1553-45c6-a028-5a9064cce07f",
      "name": {
        "__typename": "FullName",
        "firstName": "Phil",
        "lastName": "Schiler"
      }
    },
    "assigneeId": "20202020-1553-45c6-a028-5a9064cce07f",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00b6-4a7c-8001-123456789aba",
            "name": "Diagram.png"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-2\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Prepare and send the project proposal document with timeline and deliverables.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Prepare and send the project proposal document with timeline and deliverables."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-04T01:17:25.389Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0002-4e7c-8001-123456789def",
    "position": 2,
    "status": "IN_PROGRESS",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0002-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0002-4e7c-8001-123456789def",
              "title": "Send project proposal"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000200000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-0000151a0001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Send project proposal",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-1553-45c6-a028-5a9064cce07f",
      "name": {
        "__typename": "FullName",
        "firstName": "Phil",
        "lastName": "Schiler"
      }
    },
    "assigneeId": "20202020-1553-45c6-a028-5a9064cce07f",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00b7-4a7c-8001-123456789aba",
            "name": "Wireframe.png"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-3\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Review the contract terms and conditions before final approval.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Review the contract terms and conditions before final approval."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-06T01:17:25.389Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0003-4e7c-8001-123456789def",
    "position": 3,
    "status": "TODO",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0003-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0003-4e7c-8001-123456789def",
              "title": "Review contract terms"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000300000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-0000151c0001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Review contract terms",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-1553-45c6-a028-5a9064cce07f",
      "name": {
        "__typename": "FullName",
        "firstName": "Phil",
        "lastName": "Schiler"
      }
    },
    "assigneeId": "20202020-1553-45c6-a028-5a9064cce07f",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00b8-4a7c-8001-123456789aba",
            "name": "Mockup Design.png"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-4\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Create detailed agenda for upcoming strategy meeting.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Create detailed agenda for upcoming strategy meeting."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-01T01:17:25.389Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0004-4e7c-8001-123456789def",
    "position": 4,
    "status": "TODO",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0004-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0004-4e7c-8001-123456789def",
              "title": "Prepare meeting agenda"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000400000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-0000151e0001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Prepare meeting agenda",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": {
        "__typename": "FullName",
        "firstName": "Tim",
        "lastName": "Apple"
      }
    },
    "assigneeId": "20202020-0687-4c41-b707-ed1bfca972a7",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00b9-4a7c-8001-123456789aba",
            "name": "Headshot.jpg"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-5\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Verify and update contact details in the system.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Verify and update contact details in the system."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": null,
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0005-4e7c-8001-123456789def",
    "position": 5,
    "status": "DONE",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0005-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0005-4e7c-8001-123456789def",
              "title": "Update contact information"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000500000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-000015200001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Update contact information",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": {
        "__typename": "FullName",
        "firstName": "Tim",
        "lastName": "Apple"
      }
    },
    "assigneeId": "20202020-0687-4c41-b707-ed1bfca972a7",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00ba-4a7c-8001-123456789aba",
            "name": "Project Files.zip"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-6\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Complete reference verification for background check process.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Complete reference verification for background check process."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-03T01:17:25.389Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0006-4e7c-8001-123456789def",
    "position": 6,
    "status": "IN_PROGRESS",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0006-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0006-4e7c-8001-123456789def",
              "title": "Conduct reference check"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000600000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-000015220001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Conduct reference check",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-1553-45c6-a028-5a9064cce07f",
      "name": {
        "__typename": "FullName",
        "firstName": "Phil",
        "lastName": "Schiler"
      }
    },
    "assigneeId": "20202020-1553-45c6-a028-5a9064cce07f",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00bb-4a7c-8001-123456789aba",
            "name": "Backup Data.zip"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-7\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Send portfolio examples and case studies for review.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Send portfolio examples and case studies for review."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-05T01:17:25.390Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0007-4e7c-8001-123456789def",
    "position": 7,
    "status": "TODO",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0007-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0007-4e7c-8001-123456789def",
              "title": "Share portfolio samples"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000700000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-000015240001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Share portfolio samples",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": {
        "__typename": "FullName",
        "firstName": "Tim",
        "lastName": "Apple"
      }
    },
    "assigneeId": "20202020-0687-4c41-b707-ed1bfca972a7",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00bc-4a7c-8001-123456789aba",
            "name": "Source Code.zip"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-8\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Prepare onboarding materials and schedule orientation session.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Prepare onboarding materials and schedule orientation session."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-07T01:17:25.390Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0008-4e7c-8001-123456789def",
    "position": 8,
    "status": "TODO",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0008-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0008-4e7c-8001-123456789def",
              "title": "Set up onboarding process"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000800000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-000015260001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Set up onboarding process",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-1553-45c6-a028-5a9064cce07f",
      "name": {
        "__typename": "FullName",
        "firstName": "Phil",
        "lastName": "Schiler"
      }
    },
    "assigneeId": "20202020-1553-45c6-a028-5a9064cce07f",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00bd-4a7c-8001-123456789aba",
            "name": "Service Agreement.pdf"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-9\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Arrange a follow-up call to discuss project details and next steps.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Arrange a follow-up call to discuss project details and next steps."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-02T01:17:25.390Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-0009-4e7c-8001-123456789def",
    "position": 9,
    "status": "TODO",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-0009-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-0009-4e7c-8001-123456789def",
              "title": "Schedule follow-up call"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-000900000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-000015280001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Schedule follow-up call",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  },
  {
    "__typename": "Task",
    "assignee": {
      "__typename": "WorkspaceMember",
      "id": "20202020-77d5-4cb6-b60a-f4a835a85d61",
      "name": {
        "__typename": "FullName",
        "firstName": "Jony",
        "lastName": "Ive"
      }
    },
    "assigneeId": "20202020-77d5-4cb6-b60a-f4a835a85d61",
    "attachments": {
      "__typename": "AttachmentConnection",
      "edges": [
        {
          "__typename": "AttachmentEdge",
          "node": {
            "__typename": "Attachment",
            "id": "20202020-00be-4a7c-8001-123456789aba",
            "name": "NDA Document.pdf"
          }
        }
      ]
    },
    "bodyV2": {
      "__typename": "RichTextV2",
      "blocknote": "[{\"id\":\"block-10\",\"type\":\"paragraph\",\"props\":{\"textColor\":\"default\",\"backgroundColor\":\"default\",\"textAlignment\":\"left\"},\"content\":[{\"type\":\"text\",\"text\":\"Prepare and send the project proposal document with timeline and deliverables.\",\"styles\":{}}],\"children\":[]}]",
      "markdown": "Prepare and send the project proposal document with timeline and deliverables."
    },
    "createdAt": "2026-02-27T01:17:29.464Z",
    "createdBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    },
    "deletedAt": null,
    "dueAt": "2026-03-04T01:17:25.390Z",
    "favorites": {
      "__typename": "FavoriteConnection",
      "edges": []
    },
    "id": "20202020-000a-4e7c-8001-123456789def",
    "position": 10,
    "status": "IN_PROGRESS",
    "taskTargets": {
      "__typename": "TaskTargetConnection",
      "edges": [
        {
          "__typename": "TaskTargetEdge",
          "node": {
            "__typename": "TaskTarget",
            "id": "60606060-000a-4e7c-8001-123456789def",
            "task": {
              "__typename": "Task",
              "id": "20202020-000a-4e7c-8001-123456789def",
              "title": "Send project proposal"
            }
          }
        }
      ]
    },
    "timelineActivities": {
      "__typename": "TimelineActivityConnection",
      "edges": [
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-4000-8001-001000000001",
            "name": "task.created"
          }
        },
        {
          "__typename": "TimelineActivityEdge",
          "node": {
            "__typename": "TimelineActivity",
            "id": "20202020-0651-1001-8001-0000152a0001",
            "name": "linked-task.created"
          }
        }
      ]
    },
    "title": "Send project proposal",
    "updatedAt": "2026-02-27T01:17:29.464Z",
    "updatedBy": {
      "__typename": "Actor",
      "source": "MANUAL",
      "workspaceMemberId": "20202020-0687-4c41-b707-ed1bfca972a7",
      "name": "Tim A",
      "context": null
    }
  }
];
