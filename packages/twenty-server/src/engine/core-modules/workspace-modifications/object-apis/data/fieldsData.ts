
import { FieldInput } from '../types/types.js';
export function getFieldsData(objectsNameIdMap: Record<string, string>): FieldInput[] {
    return [
    {
        "field": {
            "description": "",
            "icon": "IconUsers",
            "label": "Status",
            "name": "status",
            "options": [{
                    "color": "red",
                    "label": "Not Interested",
                    "position": 0,
                    "value": "NOT_INTERESTED"
                },
                {
                    "color": "green",
                    "label": "Interested",
                    "position": 0,
                    "value": "INTERESTED"
                },
                {
                    "color": "orange",
                    "label": "CV Received",
                    "position": 0,
                    "value": "CV_RECEIVED"
                },
                {
                    "color": "turquoise",
                    "label": "Not Fit",
                    "position": 0,
                    "value": "NOT_FIT"
                },
                {
                    "color": "turquoise",
                    "label": "Sourced",
                    "position": 0,
                    "value": "SOURCED"
                },
                {
                    "color": "green",
                    "label": "Screening",
                    "position": 0,
                    "value": "SCREENING"
                },
                {
                    "color": "turquoise",
                    "label": "Recruiter Interview",
                    "position": 1,
                    "value": "RECRUITER_INTERVIEW"
                },
                {
                    "color": "sky",
                    "label": "CV Sent",
                    "position": 2,
                    "value": "CV_SENT"
                },
                {
                    "color": "blue",
                    "label": "Client Interview",
                    "position": 3,
                    "value": "CLIENT_INTERVIEW"
                },
                {
                    "color": "purple",
                    "label": "Negotiation",
                    "position": 4,
                    "value": "NEGOTIATION"
                }
            ],
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "SELECT"
        }
    },
    {
        "field": {
            "description": "Status of Candidates",
            "icon": "IconUsers",
            "label": "candConversationStatus",
            "name": "candConversationStatus",
            "options": [{
                    "color": "red",
                    "label": "Only Added No Conversation",
                    "position": 0,
                    "value": "ONLY_ADDED_NO_CONVERSATION"
                },
                {
                    "color": "green",
                    "label": "Conversation Started Has Not Responded",
                    "position": 0,
                    "value": "CONVERSATION_STARTED_HAS_NOT_RESPONDED"
                },
                {
                    "color": "orange",
                    "label": "Shared JD Has Not Responded",
                    "position": 0,
                    "value": "SHARED_JD_HAS_NOT_RESPONDED"
                },
                {
                    "color": "turquoise",
                    "label": "Candidate Refuses To Relocate",
                    "position": 0,
                    "value": "CANDIDATE_REFUSES_TO_RELOCATE"
                },
                {
                    "color": "turquoise",
                    "label": "Stopped Responding On Questions",
                    "position": 0,
                    "value": "STOPPED_RESPONDING_ON_QUESTIONS"
                },
                {
                    "color": "green",
                    "label": "Candidate Is Keen To Chat",
                    "position": 0,
                    "value": "CANDIDATE_IS_KEEN_TO_CHAT"
                },
                {
                    "color": "turquoise",
                    "label": "Candidate Has Followed Up To Setup Chat",
                    "position": 1,
                    "value": "CANDIDATE_HAS_FOLLOWED_UP_TO_SETUP_CHAT"
                },
                {
                    "color": "sky",
                    "label": "Candidate Is Reluctatnt To Discuss Compensation",
                    "position": 2,
                    "value": "CANDIDATE_IS_RELUCTANT_TO_DISCUSS_COMPENSATION"
                },
                {
                    "color": "blue",
                    "label": "Conversation Closed To Be Contacted",
                    "position": 3,
                    "value": "CONVERSATION_CLOSED_TO_BE_CONTACTED"
                }
            ],
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "SELECT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Schedule",
            "name": "schedule",
            "objectMetadataId": objectsNameIdMap.recruiterInterview,
            "type": "DATE_TIME"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Date of Interview",
            "name": "dateofInterview",
            "objectMetadataId": objectsNameIdMap.clientInterview,
            "type": "DATE_TIME"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Time Slots Available",
            "name": "timeSlotsAvailable",
            "objectMetadataId": objectsNameIdMap.interviewSchedule,
            "type": "RAW_JSON"
        }
    },
    {
        "field": {
            "description": "",
            "icon": "IconReload",
            "label": "Meeting Duration",
            "name": "durationMeeting",
            "options": [{
                    "color": "green",
                    "label": "30 mins",
                    "position": 0,
                    "value": "mins30"
                },
                {
                    "color": "turquoise",
                    "label": "45 mins",
                    "position": 1,
                    "value": "mins45"
                },
                {
                    "color": "sky",
                    "label": "1 hour",
                    "position": 2,
                    "value": "hour1"
                },
                {
                    "color": "sky",
                    "label": "1.5 hours",
                    "position": 3,
                    "value": "hours15"
                },
                {
                    "color": "sky",
                    "label": "2 hours",
                    "position": 3,
                    "value": "hours2"
                },
            ],
            "objectMetadataId": objectsNameIdMap.interviewSchedule,
            "type": "SELECT"
        }

    },
    {
        "field": {
            "description": "",
            "icon": "IconReload",
            "label": "Workspace Member Type",
            "name": "typeWorkspaceMember",
            "options": [{
                    "color": "green",
                    "label": "Candidate Type",
                    "position": 0,
                    "value": "candidateType"
                },
                {
                    "color": "turquoise",
                    "label": "Client Type",
                    "position": 1,
                    "value": "clientType"
                },
                {
                    "color": "sky",
                    "label": "Recruiter Type",
                    "position": 2,
                    "value": "recruiterType"
                },
            ],
            "objectMetadataId": objectsNameIdMap.workspaceMemberType,
            "type": "SELECT"
        }

    },
    {
        "field": {
            "description": "",
            "icon": "IconReload",
            "label": "Call Type",
            "name": "callType",
            "options": [{
                    "color": "green",
                    "label": "Incoming",
                    "position": 0,
                    "value": "INCOMING"
                },
                {
                    "color": "turquoise",
                    "label": "Outgoing",
                    "position": 1,
                    "value": "OUTGOING"
                },
                {
                    "color": "sky",
                    "label": "Missed",
                    "position": 2,
                    "value": "MISSED"
                },
                {
                    "color": "sky",
                    "label": "Rejected",
                    "position": 3,
                    "value": "REJECTED"
                },
            ],
            "objectMetadataId": objectsNameIdMap.phoneCall,
            "type": "SELECT"
        }

    },
    {
        "field": {
            "description": "",
            "icon": "IconReload",
            "label": "SMS Type",
            "name": "smsType",
            "options": [{
                    "color": "green",
                    "label": "Incoming",
                    "position": 0,
                    "value": "INCOMING"
                },
                {
                    "color": "turquoise",
                    "label": "Outgoing",
                    "position": 1,
                    "value": "OUTGOING"
                }
            ],
            "objectMetadataId": objectsNameIdMap.sms,
            "type": "SELECT"
        }

    },

    {
        "field": {
            "description": "",
            "label": "Transcription",
            "name": "transcription",
            "objectMetadataId": objectsNameIdMap.recruiterInterview,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Analysis",
            "name": "analysis",
            "objectMetadataId": objectsNameIdMap.recruiterInterview,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Date of Joining",
            "name": "dateofJoining",
            "objectMetadataId": objectsNameIdMap.offer,
            "type": "DATE_TIME"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Number of Days",
            "name": "numberofDays",
            "objectMetadataId": objectsNameIdMap.offer,
            "type": "NUMBER"
        }
    },
    {
        "field": {
            "description": "",
            "label": "From Phone",
            "name": "phoneFrom",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Salary",
            "name": "salary",
            "objectMetadataId": objectsNameIdMap.person,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "To Phone",
            "name": "phoneTo",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },

    {
        "field": {
            "description": "",
            "label": "Message",
            "name": "message",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },

    {
        "field": {
            "description": "",
            "label": "Message",
            "name": "message",
            "objectMetadataId": objectsNameIdMap.sms,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Duration",
            "name": "duration",
            "objectMetadataId": objectsNameIdMap.phoneCall,
            "type": "NUMBER"
        }
    },
    {
        "field": {
            "description": "",
            "label": "phoneNumber",
            "name": "phoneNumber",
            "objectMetadataId": objectsNameIdMap.phoneCall,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "phoneNumber",
            "name": "phoneNumber",
            "objectMetadataId": objectsNameIdMap.sms,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "TimeStamp",
            "name": "timestamp",
            "objectMetadataId": objectsNameIdMap.phoneCall,
            "type": "DATE_TIME"
        }
    },
    {
        "field": {
            "description": "",
            "label": "TimeStamp",
            "name": "timestamp",
            "objectMetadataId": objectsNameIdMap.sms,
            "type": "DATE_TIME"
        }
    },
    {
        "field": {
            "description": "",
            "label": "messageObj",
            "name": "messageObj",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "RAW_JSON"
        }
    },
      {
        "field": {
          "description": "",
          "label": "messageObjWithTimeStamp",
          "name": "messageObjWithTimeStamp",
          "objectMetadataId": objectsNameIdMap.whatsappMessage,
          "type": "RAW_JSON"
        }
      },
    {
        "field": {
            "description": "",
            "label": "whatsappProvider",
            "name": "whatsappProvider",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "whatsappMessageId",
            "name": "whatsappMessageId",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "whatsappDeliveryStatus",
            "name": "whatsappDeliveryStatus",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "typeOfMessage",
            "name": "typeOfMessage",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "lastEngagementChatControl",
            "label": "lastEngagementChatControl",
            "name": "lastEngagementChatControl",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "audioFilePath",
            "name": "audioFilePath",
            "objectMetadataId": objectsNameIdMap.whatsappMessage,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "isActive",
            "name": "isActive",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "BOOLEAN"
        }
    },
    {
        "field": {
            "description": "",
            "label": "jobLocation",
            "name": "jobLocation",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "googleSheetId",
            "name": "googleSheetId",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "googleSheetUrl",
            "name": "googleSheetUrl",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "jobCode",
            "name": "jobCode",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Search Name",
            "name": "searchName",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Reports To",
            "name": "reportsTo",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Reportees",
            "name": "reportees",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Years of Experience",
            "name": "yearsOfExperience",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Salary Bracket",
            "name": "salaryBracket",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Company Details",
            "name": "companyDetails",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Talent Considerations",
            "name": "talentConsiderations",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Specific Criteria",
            "name": "specificCriteria",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Description",
            "name": "description",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "pathPosition",
            "name": "pathPosition",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "engagementStatus",
            "name": "engagementStatus",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "BOOLEAN"
        }
    },
    
    {
        "field": {
            "description": "",
            "label": "startChat",
            "name": "startChat",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "BOOLEAN",
            "defaultValue": false

        }
    },
    {
        "field": {
            "description": "",
            "label": "startVideoInterviewChat",
            "name": "startVideoInterviewChat",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "BOOLEAN",
            "defaultValue": false


        }
    },
    {
        "field": {
            "description": "",
            "label": "chatCount",
            "name": "chatCount",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "NUMBER"
        }
    },
    {
        "field": {
            "description": "",
            "label": "startMeetingSchedulingChat",
            "name": "startMeetingSchedulingChat",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "BOOLEAN",
            "defaultValue": false

        }
    },
    {
        "field": {
            "description": "This will stop the chatbot from chatting with the candidates",
            "defaultValue": false,
            "label": "stopChat",
            "icon": "IconHandStop",
            "name": "stopChat",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "BOOLEAN"
        }
    },
    {
        "field": {
            "description": "",
            "label": "whatsappProvider",
            "name": "whatsappProvider",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "isVideoInterviewCompleted",
            "name": "isVideoInterviewCompleted",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "BOOLEAN",
            "defaultValue": false,
        }
    },
    {
        "field": {
            "description": "",
            "label": "lastEngagementChatControl",
            "name": "lastEngagementChatControl",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Job specific fields",
            "name": "jobSpecificFields",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "RAW_JSON"
        }
    },
    {
        "field": {
            "description": "",
            "label": "descriptionOneliner",
            "name": "descriptionOneliner",
            "objectMetadataId": objectsNameIdMap.company,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "remindCandidateAtTimestamp",
            "name": "remindCandidateAtTimestamp",
            "objectMetadataId": objectsNameIdMap.candidateReminder,
            "type": "DATE_TIME"
        }
    },
    {
        "field": {
            "description": "",
            "label": "remindCandidateDuration",
            "name": "remindCandidateDuration",
            "objectMetadataId": objectsNameIdMap.candidateReminder,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "isReminderActive",
            "name": "isReminderActive",
            "objectMetadataId": objectsNameIdMap.candidateReminder,
            "type": "BOOLEAN"
        }
    },
    {
        "field": {
            "description": "",
            "label": "selectedMetadataFields",
            "name": "selectedMetadataFields",
            "objectMetadataId": objectsNameIdMap.candidateEnrichment,
            "type": "RAW_JSON"
        }
    },
    {
        "field": {
            "description": "",
            "label": "modelName",
            "name": "modelName",
            "objectMetadataId": objectsNameIdMap.candidateEnrichment,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "fields",
            "name": "fields",
            "objectMetadataId": objectsNameIdMap.candidateEnrichment,
            "type": "RAW_JSON"
        }
    },
    {
        "field": {
            "description": "",
            "label": "sampleJson",
            "name": "sampleJson",
            "objectMetadataId": objectsNameIdMap.candidateEnrichment,
            "type": "RAW_JSON"
        }
    },
    {
        "field": {
            "description": "",
            "label": "prompt",
            "name": "prompt",
            "objectMetadataId": objectsNameIdMap.candidateEnrichment,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "selectedModel",
            "name": "selectedModel",
            "objectMetadataId": objectsNameIdMap.candidateEnrichment,
            "options": [{
                    "color": "green",
                    "label": "gpt-3.5-turbo",
                    "position": 0,
                    "value": "gpt35turbo"
                },
                {
                    "color": "turquoise",
                    "label": "gpt-4o",
                    "position": 1,
                    "value": "gpt4o"
                },
                {
                    "color": "turquoise",
                    "label": "gpt-4o-mini",
                    "position": 1,
                    "value": "gpt4omini"
                },
            ],
            "type": "SELECT"
        }
    },
    {
        "field": {
            "description": "",
            "label": "Arxena Job Id",
            "name": "arxenaSiteId",
            "objectMetadataId": objectsNameIdMap.job,
            "type": "TEXT"
        }
    },

    {
        "field": {
            "description": "",
            "icon": "IconFlag",
            "label": "Country",
            "name": "country",
            "options": [{
                    "color": "green",
                    "label": "India",
                    "position": 0,
                    "value": "IN"
                },
                {
                    "color": "turquoise",
                    "label": "United States",
                    "position": 1,
                    "value": "US"
                },
                {
                    "color": "sky",
                    "label": "United Kingdom",
                    "position": 2,
                    "value": "GB"
                },
                {
                    "color": "blue",
                    "label": "Japan",
                    "position": 3,
                    "value": "JP"
                },
                {
                    "color": "purple",
                    "label": "France",
                    "position": 4,
                    "value": "FR"
                }
            ],
            "objectMetadataId": objectsNameIdMap.aIModel,
            "type": "SELECT"
        }

    },

    {
        "field": {
            "description": "",
            "icon": "IconLanguage",
            "label": "Language",
            "name": "language",
            "options": [{
                    "color": "green",
                    "label": "English (United States)",
                    "position": 0,
                    "value": "ENGLISH_UNITED_STATES"
                },
                {
                    "color": "turquoise",
                    "label": "English (United Kingdom)",
                    "position": 1,
                    "value": "ENGLISH_UNITED_KINGDOM"
                },
                {
                    "color": "sky",
                    "label": "Hindi",
                    "position": 2,
                    "value": "HINDI"
                },
                {
                    "color": "blue",
                    "label": "Japanese",
                    "position": 3,
                    "value": "JAPANESE"
                },
                {
                    "color": "purple",
                    "label": "French",
                    "position": 4,
                    "value": "FRENCH"
                }
            ],
            "objectMetadataId": objectsNameIdMap.aIModel,
            "type": "SELECT"
        }
    },
    {
        "field": {
            "description": "Additional Points to be added in introduction",
            "icon": "IconAbc",
            "label": "Introduction",
            "name": "introduction",
            "objectMetadataId": objectsNameIdMap.aIInterview,
            "type": "TEXT"
        }

    },
    {
        "field": {
            "description": "Additional Instructions",
            "icon": "IconAbc",
            "label": "Instructions",
            "name": "instructions",
            "objectMetadataId": objectsNameIdMap.aIInterview,
            "type": "TEXT"
        }

    },
    {
        "field": {
            "description": "Video or Text based Interview",
            "icon": "IconAdjustmentsQuestion",
            "label": "Question Type",
            "name": "questionType",
            "options": [{
                    "color": "green",
                    "label": "Video (Uses AI Model)",
                    "position": 0,
                    "value": "VIDEO"
                },
                {
                    "color": "turquoise",
                    "label": "Test (No Model)",
                    "position": 1,
                    "value": "TEXT"
                },
            ],
            "objectMetadataId": objectsNameIdMap.aIInterviewQuestion,
            "type": "SELECT"
        }

    },

    {
        "field": {
            "description": "",
            "icon": "IconCameraQuestion",
            "label": "Answer Type",
            "name": "answerType",
            "options": [{
                    "color": "green",
                    "label": "Video (Real Time Recording)",
                    "position": 0,
                    "value": "VIDEO"
                },
                {
                    "color": "turquoise",
                    "label": "Test (No Recording)",
                    "position": 1,
                    "value": "TEXT"
                },
            ],
            "objectMetadataId": objectsNameIdMap.aIInterviewQuestion,
            "type": "SELECT"
        }

    },

    {
        "field": {
            "description": "Time Limit of Recording",
            "icon": "IconTimeDuration30",
            "label": "Time Limit",
            "name": "timeLimit",
            "objectMetadataId": objectsNameIdMap.aIInterviewQuestion,
            "type": "NUMBER"
        }

    },

    {
        "field": {
            "description": "The Question",
            "icon": "IconQuestion",
            "label": "Question Value",
            "name": "questionValue",
            "objectMetadataId": objectsNameIdMap.aIInterviewQuestion,
            "type": "TEXT"
        }

    },
    {
        "field": {
            "description": "No. of Retakes allowed in case of answer type video",
            "icon": "IconReload",
            "label": "Retakes",
            "name": "retakes",
            "options": [{
                    "color": "green",
                    "label": "0",
                    "position": 0,
                    "value": "ZERO"
                },
                {
                    "color": "turquoise",
                    "label": "1",
                    "position": 1,
                    "value": "ONE"
                },
                {
                    "color": "sky",
                    "label": "2",
                    "position": 2,
                    "value": "TWO"
                },
            ],
            "objectMetadataId": objectsNameIdMap.aIInterviewQuestion,
            "type": "SELECT"
        }

    },

    {
        "field": {
            "description": "Whether the candidate has started responding or not",
            "icon": "IconLocationQuestion",
            "label": "Started Responding",
            "name": "startedResponding",
            "objectMetadataId": objectsNameIdMap.response,
            "type": "BOOLEAN"
        }

    },
    {
        "field": {
            "description": "Whether the canadidate has completed responding or not",
            "icon": "IconLocationCheck",
            "label": "Completed Response",
            "name": "completedResponse",
            "objectMetadataId": objectsNameIdMap.response,
            "type": "BOOLEAN"
        }

    },
    {
        "field": {
            "description": "Total Time",
            "icon": "IconDeviceWatchPause",
            "label": "Timer",
            "name": "timer",
            "objectMetadataId": objectsNameIdMap.response,
            "type": "TEXT"
        }

    },
    {
        "field": {
            "description": "Time Adherence",
            "icon": "IconTimeDuration30",
            "label": "Time Limit Adherence",
            "name": "timeLimitAdherence",
            "objectMetadataId": objectsNameIdMap.response,
            "type": "BOOLEAN"
        }

    },

    {
        "field": {
            "description": "Transcript of the Response",
            "icon": "IconFileTextAI",
            "label": "Transcript",
            "name": "transcript",
            "objectMetadataId": objectsNameIdMap.response,
            "type": "TEXT"
        }

    },

    {
        "field": {
            "description": "Feedback for the Response",
            "icon": "IconPencilStar",
            "label": "Feedback",
            "name": "feedback",
            "objectMetadataId": objectsNameIdMap.response,
            "type": "TEXT"
        }

    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Full Name",
            "name": "fullName",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },

    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Age",
            "name": "age",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Years of Experience",
            "name": "yearsOfExperience",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Educational Qualifications",
            "name": "educationalQualifications",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "University College",
            "name": "universityCollege",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Current Job Title",
            "name": "currentJobTitle",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Current Company",
            "name": "currentCompany",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Current Location",
            "name": "currentLocation",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Current Role Description",
            "name": "currentRoleDescription",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Reports To",
            "name": "reportsTo",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Functions Reporting To",
            "name": "functionsReportingTo",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "reason For Leaving",
            "name": "reasonForLeaving",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Current Salary",
            "name": "currentSalary",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Expected Salary",
            "name": "expectedSalary",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "Shortlists for Client",
            "icon": "IconInputSearch",
            "label": "Notice Period",
            "name": "noticePeriod",
            "objectMetadataId": objectsNameIdMap.shortlist,
            "type": "TEXT"
        }
    },
    {
        "field": {
            "description": "uniqueStringKey for the person",
            "icon": "IconPencilStar",
            "label": "uniqueStringKey",
            "name": "uniqueStringKey",
            "objectMetadataId": objectsNameIdMap.person,
            "type": "TEXT"
        }

    },
    {
        "field": {
            "description": "uniqueStringKey for the candidate",
            "icon": "IconPencilStar",
            "label": "uniqueStringKey",
            "name": "uniqueStringKey",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "TEXT"
        }

    },

    {
        "field": {
            "description": "Link Shared with the candidate",
            "icon": "IconLink",
            "label": "Interview Link",
            "name": "interviewLink",
            "objectMetadataId": objectsNameIdMap.aIInterviewStatus,
            "type": "LINKS"
        }

    },
    {
        "field": {
            "description": "Link with Interview Review",
            "icon": "IconLink",
            "label": "Interview Review Link",
            "name": "interviewReviewLink",
            "objectMetadataId": objectsNameIdMap.aIInterviewStatus,
            "type": "LINKS"
        }

    },
    {
        "field": {
            "description": "Hiring Naukri URL",
            "icon": "IconLink",
            "label": "hiringNaukriUrl",
            "name": "hiringNaukriUrl",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "LINKS"
        }
    },
    {
        "field": {
            "description": "Resdex Naukri URL",
            "icon": "IconLink",
            "label": "resdedNaukriUrl",
            "name": "resdexNaukriUrl",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "LINKS"
        }
    },
    {
        "field": {
            "description": "Display Picture URL",
            "icon": "IconLink",
            "label": "displayPicture",
            "name": "displayPicture",
            "objectMetadataId": objectsNameIdMap.candidate,
            "type": "LINKS"
        }
    },
    {
        "field": {
            "description": "Display Picture URL",
            "icon": "IconLink",
            "label": "displayPicture",
            "name": "displayPicture",
            "objectMetadataId": objectsNameIdMap.person,
            "type": "LINKS"
        }
    },

    {
        "field": {
            "description": "Interview Started or Not",
            "icon": "IconAdjustmentsQuestion",
            "label": "Interview Started",
            "name": "interviewStarted",
            "objectMetadataId": objectsNameIdMap.aIInterviewStatus,
            "type": "BOOLEAN"
        }

    },

    {
        "field": {
            "description": "Interview Started or Not",
            "icon": "IconAdjustmentsCheck",
            "label": "Interview Completed",
            "name": "interviewCompleted",
            "objectMetadataId": objectsNameIdMap.aIInterviewStatus,
            "type": "BOOLEAN"
        }

    },

    {
        "field": {
            "description": "Camera on or not",
            "icon": "IconCameraQuestion",
            "label": "Camera On",
            "name": "cameraOn",
            "objectMetadataId": objectsNameIdMap.aIInterviewStatus,
            "type": "BOOLEAN"
        }

    },

    {
        "field": {
            "description": "Camera on or not",
            "icon": "IconMicrophone",
            "label": "Mic On",
            "name": "micOn",
            "objectMetadataId": objectsNameIdMap.aIInterviewStatus,
            "type": "BOOLEAN"
        }

    },

]

}