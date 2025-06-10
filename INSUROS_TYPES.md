# InsurOS Types

**Standard Object types added on top of twenty specific to InsurOS**

### Common Fields
- id: string
- createdAt: string (ISO 8601)
- updatedAt: string (ISO 8601)
- createdBy: string (userId)
- updatedBy: string (userId)

### Person
- id: string
- firstName: string
- lastName: string
- email: string
- phone?: string
- cell?: string
- title?: string
- role?: string
- isActive: boolean
- createdAt: string
- updatedAt: string

### MGA
- id: string
- name: string
- naic?: string
- phone?: string
- email?: string
- fullAddress?: string
- isActive: boolean
- lineOfBusiness?: string[]
- commissionStructure?: {
  newBusiness: number
  renewal: number
}
- carriers?: string[] (carrierIds)
- createdAt: string
- updatedAt: string

### ParentCarrier
- id: string
- name: string
- naic?: string
- amBestRating?: string
- isActive: boolean
- subsidiaries?: string[] (carrierIds)
- createdAt: string
- updatedAt: string

### Document
- id: string
- title: string
- type: 'COI' | 'Binder' | 'Quote' | 'App' | 'Policy' | 'Endorsement' | 'LossRun'
- status: 'Draft' | 'Sent' | 'Signed' | 'Expired' | 'Cancelled'
- linkedEntity: {
  type: 'Policy' | 'Insured' | 'Quote' | 'Renewal'
  id: string
}
- signedBy?: string
- signedAt?: string
- validUntil?: string
- fileUrl?: string
- fileSize?: number
- fileType?: string
- createdAt: string
- updatedAt: string

### Carrier
- id: string
- name: string
- naic?: string
- phone?: string
- cell?: string
- fax?: string
- email?: string
- fullAddress?: string
- isActive: boolean
- isWritingCarrier?: boolean
- isParentCarrier?: boolean
- parentCarrierId?: string
- lineOfBusiness?: string[]
- locations?: string[]
- contacts?: Person[]
- commissionNewBusiness?: {
  min: number
  max: number
}
- commissionRenewal?: {
  min: number
  max: number
}
- amBestRatingBCR?: string
- amBestRatingFSC?: string
- serviceScore?: {
  min: number
  max: number
}
- greetingName?: string
- tags?: string[]
- status: 'Active' | 'Inactive' | 'Pending'
- createdAt: string
- updatedAt: string

### Policy
- id: string
- policyNumber: string
- status: 'Active' | 'Cancelled' | 'Expired' | 'Pending'
- effectiveDate: string
- expirationDate: string
- bindDate: string
- binderId: string
- businessType: string
- businessSubType: string
- insuredBusinessType: string
- insuredType: string
- cancellationDate?: string
- billingType: string
- paymentStatus: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue'
- autoRenew: boolean
- mortgageeBilled: boolean
- insured: Insured
- carrier: Carrier
- parentCarrier: ParentCarrier
- changeDate?: string
- createDate?: string
- hasEndorsement?: boolean
- hasAgentCommission?: boolean
- hasAgencyCommission?: boolean
- mga?: MGA
- accountManager?: string
- lineOfBusinessClass?: string
- lineOfBusiness: string
- productName?: string
- policyUrl?: string
- location?: string
- agent?: string
- coverages?: string[]
- referralSource?: string
- financeCompany?: string
- zipCode?: string
- insuredTag?: string
- workGroups?: string[]
- tag?: string
- premium?: number
- nonPremium?: number
- deductibles?: {
  type: string
  amount: number
}[]
- limits?: {
  type: string
  amount: number
}[]
- endorsements?: {
  id: string
  type: string
  effectiveDate: string
  description: string
}[]
- createdAt: string
- updatedAt: string

### Insured
- id: string
- name: string
- status: 'Active' | 'Inactive' | 'Prospect'
- dba?: string
- description?: string
- typeOfBusiness?: string
- sicCode?: string
- industry?: string
- annualRevenue?: number
- employeeCount?: number
- riskClass?: string
- riskTier?: string
- greetingName?: string
- prefers?: string
- email?: string
- phone?: string
- cell?: string
- zipCode?: string
- location?: string
- origin?: string
- hasUserAccount?: boolean
- hasLinkedRecords?: boolean
- hasActivePolicy?: boolean
- hasContacts?: boolean
- agentId?: string
- accountManagerId?: string
- contacts?: Person[]
- policies?: Policy[]
- referralSource?: string
- lineOfBusiness?: string
- acquisitionDate?: string
- createDate?: string
- customerSince?: string
- numberOfYears?: number
- workGroups?: string[]
- tag?: string
- insuredParty: {
  type: 'Person' | 'Company'
  referenceId: string
}
- createdAt: string
- updatedAt: string

### QuoteApplication
- id: string
- insuredId: string
- submittedByUserId: string
- status: 'Draft' | 'Submitted' | 'Withdrawn' | 'In Progress'
- submittedAt?: string
- requestedEffectiveDate?: string
- priority: 'Low' | 'Medium' | 'High' | 'Urgent'
- assignedTo?: string
- followUpDate?: string
- lineOfBusiness: string
- documents?: Document[]
- notes?: string
- createdAt: string
- updatedAt: string

### QuoteReceived
- id: string
- quoteApplicationId: string
- carrierId: string
- underwriter?: Person
- status: 'Quoted' | 'Declined' | 'Bound' | 'Expired'
- premium: number
- effectiveDate: string
- expirationDate: string
- validUntil?: string
- terms?: string[]
- declineReason?: string
- comparison?: {
  otherCarrierId: string
  premium: number
  difference: number
}[]
- quotePdfUrl?: string
- receivedAt?: string
- createdAt: string
- updatedAt: string

### Certificate
- id: string
- insuredId: string
- certificateHolder?: {
  id: string
  name: string
  email?: string
}
- toEmail?: string
- visible: boolean
- type?: string
- description?: string
- additionalInterest?: string
- insuredTag?: string
- createDate: string
- certificateStatus?: 'Draft' | 'Issued' | 'Expired' | 'Cancelled'
- validityPeriod?: {
  start: string
  end: string
}
- coverageDetails?: {
  type: string
  limit: number
  deductible: number
}[]
- requestedBy?: string
- approvalStatus?: 'Pending' | 'Approved' | 'Rejected'
- createdAt: string
- updatedAt: string

### Renewal
- id: string
- policyId: string
- insuredId: string
- expirationDate: string
- renewalDate: string
- renewalType?: 'Auto' | 'Manual' | 'Rewrite' | 'Non-Renewal'
- status: 'Pending' | 'In Progress' | 'Renewed' | 'Lapsed' | 'Cancelled'
- linesOfBusiness?: string[]
- carrier?: string
- mga?: string
- agentId?: string
- officeLocation?: string
- premiumRange?: {
  min: number
  max: number
}
- agencyCommissionRange?: {
  min: number
  max: number
}
- description?: string
- insuredTag?: string
- policyTag?: string
- renewalNotes?: {
  date: string
  note: string
  createdBy: string
}[]
- renewalOptions?: {
  carrierId: string
  premium: number
  terms: string[]
}[]
- renewalPriority?: 'Low' | 'Medium' | 'High' | 'Urgent'
- createdAt: string
- updatedAt: string

### LossRun
- id: string
- carrierOrMGA: string
- type?: string
- requestDate: string
- resentDate?: string
- closedDate?: string
- userId?: string
- insuredId?: string
- notes?: string
- documents?: {
  id: string
  name: string
  url: string
  uploadedAt: string
}[]
- createdAt: string
- updatedAt: string

### Task
- id: string
- title: string
- description?: string
- status: 'Todo' | 'In Progress' | 'Completed' | 'Cancelled'
- priority: 'Low' | 'Medium' | 'High' | 'Urgent'
- dueDate?: string
- assignedTo?: string
- relatedEntity?: {
  type: 'Policy' | 'Insured' | 'Quote' | 'Renewal'
  id: string
}
- createdAt: string
- updatedAt: string

### Communication
- id: string
- type: 'Email' | 'Phone' | 'Meeting' | 'Note'
- direction: 'Inbound' | 'Outbound'
- status: 'Draft' | 'Sent' | 'Received' | 'Failed'
- subject?: string
- content?: string
- relatedEntity?: {
  type: 'Policy' | 'Insured' | 'Quote' | 'Renewal'
  id: string
}
- participants?: {
  type: 'User' | 'Contact' | 'Carrier'
  id: string
  name: string
}[]
- createdAt: string
- updatedAt: string

### Payment
- id: string
- amount: number
- currency: string
- status: 'Pending' | 'Paid' | 'Failed' | 'Refunded'
- paymentDate?: string
- dueDate?: string
- paymentMethod?: string
- relatedEntity?: {
  type: 'Policy' | 'Quote'
  id: string
}
- notes?: string
- createdAt: string
- updatedAt: string

### Endorsement
- id: string
- policyId: string
- type: string
- effectiveDate: string
- description: string
- status: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
- premiumChange?: number
- changes?: {
  field: string
  oldValue: any
  newValue: any
}[]
- documents?: Document[]
- createdAt: string
- updatedAt: string