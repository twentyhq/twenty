# Twenty ORM Documentation

Twenty CRM sử dụng hệ thống ORM tùy chỉnh được xây dựng trên TypeORM, được thiết kế đặc biệt cho kiến trúc multi-tenant. Tài liệu này sẽ hướng dẫn chi tiết cách sử dụng Twenty ORM trong dự án.

## Mục lục

1. [Tổng quan về Twenty ORM](#tổng-quan-về-twenty-orm)
2. [Kiến trúc Multi-tenant](#kiến-trúc-multi-tenant)
3. [TwentyORMGlobalManager](#twentyormglobalmanager)
4. [Workspace Entities](#workspace-entities)
5. [Repository Pattern](#repository-pattern)
6. [Ví dụ thực tế](#ví-dụ-thực-tế)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Tổng quan về Twenty ORM

Twenty ORM là một wrapper layer được xây dựng trên TypeORM, cung cấp:

- **Multi-tenant support**: Mỗi workspace có database schema riêng
- **Dynamic schema management**: Tự động quản lý schema cho từng workspace
- **Permission system**: Kiểm soát quyền truy cập ở repository level
- **Type safety**: Đầy đủ TypeScript support với generic types

### Core Components

```
packages/twenty-server/src/engine/twenty-orm/
   factories/
      workspace-datasource.factory.ts    # Tạo datasource cho workspace
   repository/
      workspace.repository.ts            # Custom repository implementation
   twenty-orm-global.manager.ts           # Global manager class
```

## Kiến trúc Multi-tenant

### Database Structure

Twenty CRM sử dụng **Database-per-tenant** approach:

```
PostgreSQL Database
   core_schema/                  # Core application data
      workspace                # Workspace definitions
      user                     # User management
      ...
   workspace_{workspace_id}/     # Tenant-specific schemas
       mktDepartment            # Department entities
       mktDepartmentHierarchy   # Department relationships
       ...
```

### Workspace Isolation

- Mỗi workspace có schema database riêng biệt
- Data hoàn toàn tách biệt giữa các tenant
- Schema được tạo động khi workspace mới được tạo

## TwentyORMGlobalManager

### Constructor và Dependencies

```typescript
@Injectable()
export class TwentyORMGlobalManager {
  constructor(
    private readonly workspaceDataSourceFactory: WorkspaceDatasourceFactory,
  ) {}
}
```

### Method `getRepositoryForWorkspace`

#### Function Overloads

```typescript
// Sử dụng với Entity Class
async getRepositoryForWorkspace<T extends ObjectLiteral>(
  workspaceId: string,
  workspaceEntity: Type<T>,
  options?: RepositoryOptions
): Promise<WorkspaceRepository<T>>

// Sử dụng với Object Metadata Name
async getRepositoryForWorkspace<T extends ObjectLiteral>(
  workspaceId: string,
  objectMetadataName: string,
  options?: RepositoryOptions
): Promise<WorkspaceRepository<T>>
```

#### Parameters

##### 1. `workspaceId: string`
- **Mục đích**: Xác định workspace cần truy cập
- **Format**: UUID string
- **Ví dụ**: `"123e4567-e89b-12d3-a456-426614174000"`

##### 2. `workspaceEntityOrObjectMetadataName`
- **Type 1 - Entity Class**: `Type<T>`
  ```typescript
  MktDepartmentWorkspaceEntity // Class reference
  ```
- **Type 2 - String**: `string`
  ```typescript
  'mktDepartment' // Object metadata name
  ```

##### 3. `options: RepositoryOptions`
```typescript
type RepositoryOptions = {
  shouldBypassPermissionChecks?: boolean; // Default: false
  roleId?: string;                        // User role ID
}
```

#### Permission System

##### `shouldBypassPermissionChecks: boolean`
- **true**: Bỏ qua tất cả permission checks (admin mode)
- **false**: Áp dụng permission rules theo roleId
- **Use cases**:
    - `true`: System operations, migrations, admin tasks
    - `false`: User-facing operations

##### `roleId: string`
- ID của role để kiểm tra permissions
- Chỉ áp dụng khi `shouldBypassPermissionChecks = false`

#### Internal Implementation

```typescript
async getRepositoryForWorkspace<T extends ObjectLiteral>(
  workspaceId: string,
  workspaceEntityOrObjectMetadataName: Type<T> | string,
  options = { shouldBypassPermissionChecks: false }
): Promise<WorkspaceRepository<T>> {
  // 1. Convert entity class to metadata name if needed
  let objectMetadataName: string;
  if (typeof workspaceEntityOrObjectMetadataName === 'string') {
    objectMetadataName = workspaceEntityOrObjectMetadataName;
  } else {
    objectMetadataName = convertClassNameToObjectMetadataName(
      workspaceEntityOrObjectMetadataName.name
    );
  }

  // 2. Create/get workspace datasource
  const workspaceDataSource = 
    await this.workspaceDataSourceFactory.create(workspaceId);

  // 3. Get repository with permissions
  const repository = workspaceDataSource.getRepository<T>(
    objectMetadataName,
    options.shouldBypassPermissionChecks,
    options.roleId
  );

  return repository;
}
```

### Other Methods

#### `getDataSourceForWorkspace`
```typescript
async getDataSourceForWorkspace({ workspaceId }: { workspaceId: string }) {
  return await this.workspaceDataSourceFactory.create(workspaceId);
}
```
- Trả về raw DataSource object cho advanced operations
- Sử dụng cho migrations, bulk operations

#### `destroyDataSourceForWorkspace`
```typescript
async destroyDataSourceForWorkspace(workspaceId: string) {
  await this.workspaceDataSourceFactory.destroy(workspaceId);
}
```
- Đóng connection và giải phóng memory
- Sử dụng khi workspace bị xóa hoặc cleanup

## Workspace Entities

### Entity Definition

```typescript
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';

@WorkspaceEntity({
  standardId: 'mktDepartment',
  namePlural: 'mktDepartments',
  labelSingular: 'Department',
  labelPlural: 'Departments',
  description: 'Department entity for organizational structure',
  icon: 'IconBuilding',
})
export class MktDepartmentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: 'departmentCode',
    type: FieldMetadataType.TEXT,
    label: 'Department Code',
    description: 'Unique code for department',
  })
  departmentCode: string;

  @WorkspaceField({
    standardId: 'departmentName', 
    type: FieldMetadataType.TEXT,
    label: 'Department Name',
    description: 'Display name of department',
  })
  departmentName: string;

  @WorkspaceField({
    standardId: 'displayOrder',
    type: FieldMetadataType.NUMBER,
    label: 'Display Order',
    description: 'Order for displaying departments',
  })
  displayOrder: number;
}
```

### Entity Features

#### Base Fields (từ BaseWorkspaceEntity)
```typescript
id: string;           // UUID primary key
createdAt: Date;      // Creation timestamp  
updatedAt: Date;      // Last update timestamp
deletedAt?: Date;     // Soft delete timestamp
```

#### Workspace Decorators
- `@WorkspaceEntity()`: Định nghĩa entity metadata
- `@WorkspaceField()`: Định nghĩa field properties
- `@WorkspaceRelation()`: Định nghĩa relationships

## Repository Pattern

### Service Implementation

```typescript
@Injectable()
export class DepartmentService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private async getRepositories(workspaceId: string) {
    const departmentRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'mktDepartment',
        { shouldBypassPermissionChecks: true }
      );

    const hierarchyRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'mktDepartmentHierarchy', 
        { shouldBypassPermissionChecks: true }
      );

    return { departmentRepository, hierarchyRepository };
  }

  async findDepartmentById(
    workspaceId: string, 
    departmentId: string
  ): Promise<MktDepartmentWorkspaceEntity | null> {
    const { departmentRepository } = await this.getRepositories(workspaceId);
    
    return await departmentRepository.findOne({
      where: { id: departmentId }
    }) as MktDepartmentWorkspaceEntity;
  }
}
```

### Repository Operations

#### Basic CRUD Operations

```typescript
// CREATE
const newDepartment = await departmentRepository.save({
  departmentCode: 'IT',
  departmentName: 'Information Technology',
  displayOrder: 1
});

// READ
const department = await departmentRepository.findOne({
  where: { departmentCode: 'IT' }
});

const departments = await departmentRepository.find({
  where: { deletedAt: null },
  order: { displayOrder: 'ASC' }
});

// UPDATE  
await departmentRepository.update(
  { id: departmentId },
  { departmentName: 'IT Department' }
);

// DELETE (Soft delete)
await departmentRepository.softDelete({ id: departmentId });
```

#### Complex Queries

```typescript
// Query với relations
const departmentsWithHierarchy = await departmentRepository.find({
  relations: ['parentHierarchy', 'childHierarchies'],
  where: { deletedAt: null }
});

// Query Builder
const queryResult = await departmentRepository
  .createQueryBuilder('dept')
  .leftJoinAndSelect('dept.hierarchies', 'hierarchy')
  .where('dept.departmentCode LIKE :code', { code: '%IT%' })
  .orderBy('dept.displayOrder', 'ASC')
  .getMany();

// Raw queries
const rawResult = await departmentRepository.query(`
  SELECT d.*, COUNT(h.id) as hierarchy_count
  FROM mktDepartment d
  LEFT JOIN mktDepartmentHierarchy h ON d.id = h.parentDepartmentId
  WHERE d.deletedAt IS NULL
  GROUP BY d.id
  ORDER BY d.displayOrder ASC
`);
```

## Ví dụ thực tế

### Complete Service Example

```typescript
@Injectable()
export class DepartmentService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async createDepartment(
    workspaceId: string,
    createData: CreateDepartmentInput
  ): Promise<MktDepartmentWorkspaceEntity> {
    const { departmentRepository } = await this.getRepositories(workspaceId);

    // Validate unique department code
    const existing = await departmentRepository.findOne({
      where: { departmentCode: createData.departmentCode }
    });

    if (existing) {
      throw new ConflictException('Department code already exists');
    }

    // Create department
    const department = await departmentRepository.save({
      departmentCode: createData.departmentCode,
      departmentName: createData.departmentName,
      displayOrder: createData.displayOrder,
    });

    return department as MktDepartmentWorkspaceEntity;
  }

  async getDepartmentTree(
    workspaceId: string,
    rootDepartmentId: string
  ): Promise<DepartmentTreeNode> {
    const { departmentRepository, hierarchyRepository } = 
      await this.getRepositories(workspaceId);

    // Get root department
    const rootDepartment = await departmentRepository.findOne({
      where: { id: rootDepartmentId }
    });

    if (!rootDepartment) {
      throw new NotFoundException('Department not found');
    }

    // Build tree recursively
    const tree = await this.buildDepartmentTree(
      departmentRepository,
      hierarchyRepository,
      rootDepartmentId,
      0,
      5 // max depth
    );

    return tree;
  }

  private async buildDepartmentTree(
    departmentRepository: WorkspaceRepository<any>,
    hierarchyRepository: WorkspaceRepository<any>,
    parentId: string,
    currentDepth: number,
    maxDepth: number
  ): Promise<DepartmentTreeNode> {
    if (currentDepth >= maxDepth) return null;

    // Get current department
    const department = await departmentRepository.findOne({
      where: { id: parentId }
    });

    // Get children
    const childHierarchies = await hierarchyRepository.find({
      where: { parentDepartmentId: parentId, isActive: true },
      relations: ['childDepartment'],
      order: { displayOrder: 'ASC' }
    });

    // Build children trees
    const children = await Promise.all(
      childHierarchies.map(async (hierarchy) => {
        return await this.buildDepartmentTree(
          departmentRepository,
          hierarchyRepository,
          hierarchy.childDepartmentId,
          currentDepth + 1,
          maxDepth
        );
      })
    );

    return {
      id: department.id,
      departmentCode: department.departmentCode,
      departmentName: department.departmentName,
      level: currentDepth,
      children: children.filter(Boolean)
    };
  }

  private async getRepositories(workspaceId: string) {
    const departmentRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'mktDepartment',
        { shouldBypassPermissionChecks: true }
      );

    const hierarchyRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'mktDepartmentHierarchy',
        { shouldBypassPermissionChecks: true }
      );

    return { departmentRepository, hierarchyRepository };
  }
}
```

### GraphQL Resolver Integration

```typescript
@Resolver()
export class DepartmentResolver {
  constructor(private readonly departmentService: DepartmentService) {}

  @Query(() => [MktDepartmentWorkspaceEntity])
  @UseGuards(UserAuthGuard)
  async getDepartments(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('filters', { nullable: true }) filters?: DepartmentFilters
  ): Promise<MktDepartmentWorkspaceEntity[]> {
    return await this.departmentService.findDepartments(workspaceId, filters);
  }

  @Mutation(() => MktDepartmentWorkspaceEntity)
  @UseGuards(UserAuthGuard)
  async createDepartment(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('input') input: CreateDepartmentInput
  ): Promise<MktDepartmentWorkspaceEntity> {
    return await this.departmentService.createDepartment(workspaceId, input);
  }
}
```

## Best Practices

### 1. Repository Management

```typescript
// ✅ Good: Centralized repository getter
private async getRepositories(workspaceId: string) {
  const departmentRepo = await this.twentyORMGlobalManager.getRepositoryForWorkspace(
    workspaceId,
    'mktDepartment',
    { shouldBypassPermissionChecks: true }
  );
  return { departmentRepo };
}

// ❌ Bad: Getting repository in every method
async someMethod(workspaceId: string) {
  const repo = await this.twentyORMGlobalManager.getRepositoryForWorkspace(/*...*/);
  // method implementation
}
```

### 2. Type Safety

```typescript
// ✅ Good: Proper typing with casting
const department = await departmentRepository.findOne({
  where: { id }
}) as MktDepartmentWorkspaceEntity;

// ✅ Good: Using generics
const repository = await this.twentyORMGlobalManager.getRepositoryForWorkspace<
  MktDepartmentWorkspaceEntity
>(workspaceId, 'mktDepartment');
```

### 3. Error Handling

```typescript
// ✅ Good: Proper error handling
async findDepartmentById(workspaceId: string, id: string) {
  try {
    const { departmentRepository } = await this.getRepositories(workspaceId);
    const department = await departmentRepository.findOne({ where: { id } });
    
    if (!department) {
      throw new NotFoundException(`Department ${id} not found`);
    }
    
    return department;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException('Failed to fetch department');
  }
}
```

### 4. Permission Handling

```typescript
// ✅ Good: Use appropriate permission settings
// System operations
const adminRepo = await this.twentyORMGlobalManager.getRepositoryForWorkspace(
  workspaceId,
  'mktDepartment',
  { shouldBypassPermissionChecks: true }
);

// User operations  
const userRepo = await this.twentyORMGlobalManager.getRepositoryForWorkspace(
  workspaceId,
  'mktDepartment', 
  { shouldBypassPermissionChecks: false, roleId: userRoleId }
);
```

### 5. Query Optimization

```typescript
// ✅ Good: Use select to limit fields
const departments = await departmentRepository.find({
  select: ['id', 'departmentCode', 'departmentName'],
  where: { deletedAt: null }
});

// ✅ Good: Use relations efficiently
const departmentsWithParent = await departmentRepository.find({
  relations: ['parentHierarchy.parentDepartment'],
  where: { deletedAt: null }
});

// ✅ Good: Use pagination
const [departments, total] = await departmentRepository.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
  order: { displayOrder: 'ASC' }
});
```

## Troubleshooting

### Common Issues

#### 1. "Repository not found" Error
```typescript
// Problem: Incorrect metadata name
const repo = await this.twentyORMGlobalManager.getRepositoryForWorkspace(
  workspaceId,
  'department' // ❌ Wrong name
);

// Solution: Use correct metadata name
const repo = await this.twentyORMGlobalManager.getRepositoryForWorkspace(
  workspaceId,
  'mktDepartment' // ✅ Correct name
);
```

#### 2. Permission Denied Error
```typescript
// Problem: Missing permission bypass for system operations
const repo = await this.twentyORMGlobalManager.getRepositoryForWorkspace(
  workspaceId,
  'mktDepartment'
  // Missing options
);

// Solution: Add appropriate options
const repo = await this.twentyORMGlobalManager.getRepositoryForWorkspace(
  workspaceId,
  'mktDepartment',
  { shouldBypassPermissionChecks: true } // For system operations
);
```

#### 3. Type Casting Issues
```typescript
// Problem: TypeScript doesn't know the exact type
const department = await repo.findOne({ where: { id } });
// department is ObjectLiteral, not the specific entity type

// Solution: Cast to specific type
const department = await repo.findOne({ 
  where: { id } 
}) as MktDepartmentWorkspaceEntity;
```

#### 4. Memory Leaks
```typescript
// Problem: Not destroying unused connections
// Solution: Cleanup when done
await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(workspaceId);
```

### Debugging Tips

#### 1. Enable Query Logging
```typescript
// In development, check the generated SQL
const queryResult = await repo
  .createQueryBuilder('dept')
  .where('dept.id = :id', { id })
  .getMany();

// Log the generated query
console.log(queryResult.getQuery());
```

#### 2. Check Entity Registration
```typescript
// Verify entity is properly registered
const dataSource = await this.twentyORMGlobalManager
  .getDataSourceForWorkspace({ workspaceId });
  
console.log('Available entities:', dataSource.entityMetadatas.map(m => m.name));
```

#### 3. Validate Workspace
```typescript
// Ensure workspace exists and is accessible
try {
  const dataSource = await this.twentyORMGlobalManager
    .getDataSourceForWorkspace({ workspaceId });
  console.log('Workspace connection successful');
} catch (error) {
  console.error('Workspace connection failed:', error.message);
}
```

### Performance Monitoring

```typescript
// Monitor query performance
const startTime = Date.now();
const result = await repository.find(queryOptions);
const endTime = Date.now();
console.log(`Query executed in ${endTime - startTime}ms`);

// Monitor memory usage
const used = process.memoryUsage();
console.log('Memory usage:', {
  rss: Math.round(used.rss / 1024 / 1024) + 'MB',
  heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB'
});
```

## Kết luận

Twenty ORM cung cấp một layer abstraction mạnh mẽ cho việc quản lý multi-tenant database trong Twenty CRM. Việc hiểu rõ cách sử dụng `TwentyORMGlobalManager` và các patterns liên quan sẽ giúp bạn phát triển features hiệu quả và maintainable.

Key takeaways:
- Luôn sử dụng `TwentyORMGlobalManager` để lấy repositories
- Chú ý đến permission settings tùy theo use case
- Implement proper error handling và type safety
- Optimize queries và monitor performance
- Cleanup resources khi không sử dụng

Để biết thêm chi tiết, tham khảo source code trong thư mục `src/engine/twenty-orm/` và các ví dụ implementation trong các modules hiện có.
