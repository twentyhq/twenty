import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { DomainManagerService } from './domain-manager.service';

describe('DomainManagerService', () => {
  let domainManagerService: DomainManagerService;
  let environmentService: EnvironmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainManagerService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useClass: Repository,
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
  });

  describe('buildBaseUrl', () => {
    it('should build the base URL with protocol and domain from environment variables', () => {
      jest
        .spyOn(environmentService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONT_PROTOCOL: 'https',
            FRONT_DOMAIN: 'example.com',
          };

          return env[key];
        });

      const result = domainManagerService.getBaseUrl();

      expect(result.toString()).toBe('https://example.com/');
    });

    it('should append default subdomain if multiworkspace is enabled', () => {
      jest
        .spyOn(environmentService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONT_PROTOCOL: 'https',
            FRONT_DOMAIN: 'example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
            DEFAULT_SUBDOMAIN: 'test',
          };

          return env[key];
        });

      const result = domainManagerService.getBaseUrl();

      expect(result.toString()).toBe('https://test.example.com/');
    });

    it('should append port if FRONT_PORT is set', () => {
      jest
        .spyOn(environmentService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONT_PROTOCOL: 'https',
            FRONT_DOMAIN: 'example.com',
            FRONT_PORT: '8080',
          };

          return env[key];
        });

      const result = domainManagerService.getBaseUrl();

      expect(result.toString()).toBe('https://example.com:8080/');
    });
  });

  describe('buildWorkspaceURL', () => {
    it('should build workspace URL with given subdomain', () => {
      jest
        .spyOn(environmentService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONT_PROTOCOL: 'https',
            FRONT_DOMAIN: 'example.com',
            IS_MULTIWORKSPACE_ENABLED: true,
            DEFAULT_SUBDOMAIN: 'default',
          };

          return env[key];
        });

      const result = domainManagerService.buildWorkspaceURL({
        subdomain: 'test',
      });

      expect(result.toString()).toBe('https://test.example.com/');
    });

    it('should set the pathname if provided', () => {
      jest
        .spyOn(environmentService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONT_PROTOCOL: 'https',
            FRONT_DOMAIN: 'example.com',
          };

          return env[key];
        });

      const result = domainManagerService.buildWorkspaceURL({
        pathname: '/path/to/resource',
      });

      expect(result.pathname).toBe('/path/to/resource');
    });

    it('should set the search parameters if provided', () => {
      jest
        .spyOn(environmentService, 'get')
        .mockImplementation((key: string) => {
          const env = {
            FRONT_PROTOCOL: 'https',
            FRONT_DOMAIN: 'example.com',
          };

          return env[key];
        });

      const result = domainManagerService.buildWorkspaceURL({
        searchParams: {
          foo: 'bar',
          baz: 123,
        },
      });

      expect(result.searchParams.get('foo')).toBe('bar');
      expect(result.searchParams.get('baz')).toBe('123');
    });
  });
});
