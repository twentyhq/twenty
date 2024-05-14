# database.tf

resource "azurerm_container_app" "day1ai_db" {
  name                         = local.db_app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  depends_on = [azurerm_container_app_environment_storage.db]

  ingress {
    allow_insecure_connections = false
    external_enabled           = false
    target_port                = 5432
    transport                  = "tcp"
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1
    container {
      name   = local.db_app_name
      image  = "docker.io/twentycrm/twenty-postgres:${local.db_tag}"
      cpu    = local.cpu
      memory = local.memory

      volume_mounts {
        name = "twenty-db-data"
        path = "/var/lib/postgresql/data"
      }

      env {
        name  = "POSTGRES_USER"
        value = "postgres"
      }
      env {
        name  = "POSTGRES_PASSWORD"
        value = "postgres"
      }
      env {
        name  = "POSTGRES_DB"
        value = "default"
      }
    }

    volume {
      name         = "twenty-db-data"
      storage_type = "AzureFile"
      storage_name = local.storage_mount_db_name
    }
  }
}