---
name: backend-module
description: Create a new NestJS backend module in twenty-server with resolver, service, entity, DTOs, and module registration. Use when adding new server-side functionality.
---

# Backend Module Creation

**Purpose**: Step-by-step guide for creating a new NestJS module in `packages/twenty-server/` with the standard structure used across the Twenty codebase.

**When to use**: When adding new server-side functionality — a new API, business logic, or data model.

---

## Module Directory Structure

```
packages/twenty-server/src/modules/{module-name}/
├── {module-name}.module.ts           # NestJS module definition
├── {module-name}.service.ts          # Core business logic
├── {module-name}.resolver.ts         # GraphQL resolver (if exposed via API)
├── {module-name}.exception.ts        # Custom exceptions
├── entities/                          # TypeORM entities (if data-backed)
│   └── {module-name}.entity.ts
├── dtos/                              # Data Transfer Objects
│   ├── create-{module-name}.input.ts
│   └── update-{module-name}.input.ts
├── services/                          # Additional services
│   └── {specific-name}.service.ts
├── query-hooks/                       # CRUD interception hooks (Omnia pattern)
│   ├── {object}-create-one.pre-query.hook.ts
│   └── {object}-query-hook.module.ts
├── utils/                             # Utility functions
│   └── {util-name}.util.ts
└── __tests__/                         # Test files
    └── {module-name}.spec.ts
```

Not every module needs every directory. Create only what you need.

---

## Step 1: Define the Entity (if data-backed)

**File**: `modules/{module-name}/entities/{module-name}.entity.ts`

```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('moduleName')
export class ModuleNameEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
```

**Entity conventions:**
- Class name: `PascalCase` + `Entity` suffix
- Table name in `@Entity()`: `camelCase`
- Use `uuid` for primary keys
- Use `timestamptz` for date columns
- Always include `createdAt` and `updatedAt`

---

## Step 2: Create DTOs

### Input DTO

**File**: `modules/{module-name}/dtos/create-{module-name}.input.ts`

```typescript
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateModuleNameInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;
}
```

### Update DTO

**File**: `modules/{module-name}/dtos/update-{module-name}.input.ts`

```typescript
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateModuleNameInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;
}
```

**DTO conventions:**
- Class name: `Create{Name}Input`, `Update{Name}Input`
- Use `class-validator` decorators for validation
- Update DTOs make all fields optional
- File name: `kebab-case.input.ts`

---

## Step 3: Create the Service

**File**: `modules/{module-name}/{module-name}.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ModuleNameEntity } from './entities/{module-name}.entity';

@Injectable()
export class ModuleNameService {
  constructor(
    @InjectRepository(ModuleNameEntity, 'core')
    private readonly moduleNameRepository: Repository<ModuleNameEntity>,
  ) {}

  async findAll(): Promise<ModuleNameEntity[]> {
    return this.moduleNameRepository.find();
  }

  async findById(id: string): Promise<ModuleNameEntity | null> {
    return this.moduleNameRepository.findOne({ where: { id } });
  }

  async create(input: CreateModuleNameInput): Promise<ModuleNameEntity> {
    const entity = this.moduleNameRepository.create(input);
    return this.moduleNameRepository.save(entity);
  }

  async update(
    id: string,
    input: UpdateModuleNameInput,
  ): Promise<ModuleNameEntity> {
    await this.moduleNameRepository.update(id, input);
    return this.moduleNameRepository.findOneOrFail({ where: { id } });
  }
}
```

**Service conventions:**
- Class name: `PascalCase` + `Service` suffix
- Inject repositories with `@InjectRepository(Entity, 'core')` for core entities
- Return entity types from service methods
- One primary service per module; additional services go in `services/` directory

---

## Step 4: Create the Resolver

**File**: `modules/{module-name}/{module-name}.resolver.ts`

```typescript
import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class ModuleNameResolver {
  constructor(
    private readonly moduleNameService: ModuleNameService,
  ) {}

  @Query(() => [ModuleNameDTO])
  async findManyModuleNames(): Promise<ModuleNameDTO[]> {
    return this.moduleNameService.findAll();
  }

  @Query(() => ModuleNameDTO)
  async findOneModuleName(
    @Args('id') id: string,
  ): Promise<ModuleNameDTO> {
    return this.moduleNameService.findById(id);
  }

  @Mutation(() => ModuleNameDTO)
  async createModuleName(
    @Args('input') input: CreateModuleNameInput,
  ): Promise<ModuleNameDTO> {
    return this.moduleNameService.create(input);
  }

  @Mutation(() => ModuleNameDTO)
  async updateModuleName(
    @Args('id') id: string,
    @Args('input') input: UpdateModuleNameInput,
  ): Promise<ModuleNameDTO> {
    return this.moduleNameService.update(id, input);
  }
}
```

**Resolver conventions:**
- Class name: `PascalCase` + `Resolver` suffix
- Always apply `@UseGuards(WorkspaceAuthGuard)` at class level
- Query names: `findMany{Name}s`, `findOne{Name}`
- Mutation names: `create{Name}`, `update{Name}`, `delete{Name}`

**Common decorators:**
| Decorator | Purpose |
|-----------|---------|
| `@UseGuards(WorkspaceAuthGuard)` | Require authenticated workspace |
| `@UseGuards(SettingsPermissionGuard(PermissionFlagType.X))` | Require specific permission |
| `@UsePipes(ResolverValidationPipe)` | Validate DTO inputs |
| `@UseFilters(...)` | Exception filtering |
| `@AuthWorkspace()` | Extract workspace from context |
| `@AuthUser()` | Extract user from context |

---

## Step 5: Create Custom Exceptions

**File**: `modules/{module-name}/{module-name}.exception.ts`

```typescript
import { CustomException } from 'src/utils/custom-exception';

export class ModuleNameException extends CustomException {
  constructor(message: string, code: ModuleNameExceptionCode) {
    super(message, code);
  }
}

export enum ModuleNameExceptionCode {
  MODULE_NAME_NOT_FOUND = 'MODULE_NAME_NOT_FOUND',
  MODULE_NAME_ALREADY_EXISTS = 'MODULE_NAME_ALREADY_EXISTS',
}
```

---

## Step 6: Register the Module

**File**: `modules/{module-name}/{module-name}.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ModuleNameEntity } from './entities/{module-name}.entity';
import { ModuleNameService } from './{module-name}.service';
import { ModuleNameResolver } from './{module-name}.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModuleNameEntity], 'core'),
  ],
  providers: [ModuleNameService, ModuleNameResolver],
  exports: [ModuleNameService],
})
export class ModuleNameModule {}
```

**Then register in the parent module.** For Omnia custom modules, this is typically the app module or a feature-area module. Find the appropriate parent and add:

```typescript
imports: [
  // ... existing imports
  ModuleNameModule,
],
```

---

## Step 7: Create Migration (if new entity)

```bash
npx nx run twenty-server:typeorm -- migration:generate \
  src/database/typeorm/core/migrations/common/{timestamp}-add-{module-name} \
  -d src/database/typeorm/core/core.datasource.ts
```

Review the generated migration to ensure it only contains your intended changes.

---

## Step 8: Write Tests

**File**: `modules/{module-name}/__tests__/{module-name}.service.spec.ts`

```typescript
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ModuleNameService } from '../{module-name}.service';
import { ModuleNameEntity } from '../entities/{module-name}.entity';

describe('ModuleNameService', () => {
  let service: ModuleNameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleNameService,
        {
          provide: getRepositoryToken(ModuleNameEntity, 'core'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ModuleNameService>(ModuleNameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

Run tests:

```bash
npx jest modules/{module-name}/__tests__/{module-name}.service.spec.ts \
  --config=packages/twenty-server/jest.config.mjs
```

---

## For Omnia Custom Modules

When creating a module that's 100% Omnia code (not modifying upstream):

1. Place it in `packages/twenty-server/src/modules/{module-name}/`
2. Add entries to `CUSTOMIZATIONS.md` under "Custom Server Modules"
3. Add `check_file_exists` entries in `scripts/check-customizations.sh`
4. See [customization-tracking skill](../customization-tracking/SKILL.md)

---

## Checklist

- [ ] Entity uses `uuid` primary key and `timestamptz` dates
- [ ] DTOs use `class-validator` decorators
- [ ] Service is `@Injectable()` with proper repository injection
- [ ] Resolver has `@UseGuards(WorkspaceAuthGuard)` at class level
- [ ] Module registered with `TypeOrmModule.forFeature()` and parent module
- [ ] Migration generated and reviewed
- [ ] Tests written for service (at minimum)
- [ ] `npx nx typecheck twenty-server` passes
- [ ] Customization tracking updated — see [customization-tracking skill](../customization-tracking/SKILL.md)
