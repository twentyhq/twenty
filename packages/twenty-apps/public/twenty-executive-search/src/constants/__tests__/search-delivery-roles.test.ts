import { describe, expect, it } from 'vitest';

import { COORDINATOR_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/coordinator-role-universal-identifier';
import { RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/researcher-role-universal-identifier';
import { SEARCH_PARTNER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/search-partner-role-universal-identifier';
import coordinatorRole from 'src/roles/coordinator.role';
import researcherRole from 'src/roles/researcher.role';
import searchPartnerRole from 'src/roles/search-partner.role';

describe('search-delivery-roles', () => {
  describe('Search Partner role', () => {
    it('should return a successful validation result', () => {
      const result = searchPartnerRole;

      expect(result.success).toBe(true);
    });

    it('should have the correct universalIdentifier', () => {
      const result = searchPartnerRole;

      expect(result.config?.universalIdentifier).toBe(
        SEARCH_PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
      );
    });

    it('should have restricted record-level permissions', () => {
      const result = searchPartnerRole;

      expect(result.config?.canReadAllObjectRecords).toBe(false);
      expect(result.config?.canUpdateAllObjectRecords).toBe(false);
    });

    it('should have empty object permissions and field permissions', () => {
      const result = searchPartnerRole;

      expect(result.config?.objectPermissions).toEqual([]);
      expect(result.config?.fieldPermissions).toEqual([]);
    });

    it('should be assignable to users', () => {
      const result = searchPartnerRole;

      expect(result.config?.canBeAssignedToUsers).toBe(true);
    });
  });

  describe('Researcher/Sourcer role', () => {
    it('should return a successful validation result', () => {
      const result = researcherRole;

      expect(result.success).toBe(true);
    });

    it('should have the correct universalIdentifier', () => {
      const result = researcherRole;

      expect(result.config?.universalIdentifier).toBe(
        RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
      );
    });

    it('should have restricted record-level permissions', () => {
      const result = researcherRole;

      expect(result.config?.canReadAllObjectRecords).toBe(false);
      expect(result.config?.canUpdateAllObjectRecords).toBe(false);
    });

    it('should have empty object permissions and field permissions', () => {
      const result = researcherRole;

      expect(result.config?.objectPermissions).toEqual([]);
      expect(result.config?.fieldPermissions).toEqual([]);
    });

    it('should be assignable to users', () => {
      const result = researcherRole;

      expect(result.config?.canBeAssignedToUsers).toBe(true);
    });
  });

  describe('Coordinator role', () => {
    it('should return a successful validation result', () => {
      const result = coordinatorRole;

      expect(result.success).toBe(true);
    });

    it('should have the correct universalIdentifier', () => {
      const result = coordinatorRole;

      expect(result.config?.universalIdentifier).toBe(
        COORDINATOR_ROLE_UNIVERSAL_IDENTIFIER,
      );
    });

    it('should have restricted record-level permissions', () => {
      const result = coordinatorRole;

      expect(result.config?.canReadAllObjectRecords).toBe(false);
      expect(result.config?.canUpdateAllObjectRecords).toBe(false);
    });

    it('should have empty object permissions and field permissions', () => {
      const result = coordinatorRole;

      expect(result.config?.objectPermissions).toEqual([]);
      expect(result.config?.fieldPermissions).toEqual([]);
    });

    it('should be assignable to users', () => {
      const result = coordinatorRole;

      expect(result.config?.canBeAssignedToUsers).toBe(true);
    });
  });
});
