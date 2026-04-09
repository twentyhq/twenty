import { type SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatSkill = UniversalFlatEntityFrom<SkillEntity, 'skill'>;
